import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { and, asc, desc, eq, gte, gt, inArray, like, lt, lte, ne, sql } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/db/client'
import { boats, bookings, customers, crewMembers, tenants } from '@/lib/db/schema'
import type { Booking } from '@/types'

type BookingStatus = Booking['status']

const STATUSES: BookingStatus[] = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
const ACTIVE_STATUSES: BookingStatus[] = ['confirmed', 'in_progress']

interface BookingCreateBody {
  tenantSlug?: unknown
  boatId?: unknown
  customerId?: unknown
  crewIds?: unknown
  status?: unknown
  startAt?: unknown
  endAt?: unknown
  totalPrice?: unknown
  notes?: unknown
  createdBy?: unknown
}

async function resolveTenantBySlug(slug: string) {
  const rows = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1)
  return rows[0] ?? null
}

function toIsoDate(value: unknown): string | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

async function findBoatConflict(
  tenantId: string,
  boatId: string,
  startAt: string,
  endAt: string,
  excludeId: string | null
): Promise<Booking | null> {
  const conditions = [
    eq(bookings.tenantId, tenantId),
    eq(bookings.boatId, boatId),
    inArray(bookings.status, ACTIVE_STATUSES),
    lt(bookings.startAt, endAt),
    gt(bookings.endAt, startAt),
  ]
  if (excludeId) conditions.push(ne(bookings.id, excludeId))
  const rows = await db.select().from(bookings).where(and(...conditions)).limit(1)
  return rows[0] ?? null
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const tenantSlug = sp.get('tenantSlug')
  if (!tenantSlug) {
    return NextResponse.json({ error: 'tenantSlug is required' }, { status: 400 })
  }

  const tenant = await resolveTenantBySlug(tenantSlug)
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  }

  const status = sp.get('status')
  if (status && !STATUSES.includes(status as BookingStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const dateFrom = sp.get('dateFrom') ? toIsoDate(sp.get('dateFrom')) : null
  const dateTo = sp.get('dateTo') ? toIsoDate(sp.get('dateTo')) : null
  if ((sp.get('dateFrom') && !dateFrom) || (sp.get('dateTo') && !dateTo)) {
    return NextResponse.json({ error: 'dateFrom/dateTo must be valid dates' }, { status: 400 })
  }

  const pageParam = Number(sp.get('page') ?? '1')
  const pageSizeParam = Number(sp.get('pageSize') ?? '10')
  const page = Number.isInteger(pageParam) && pageParam >= 1 ? pageParam : 1
  const pageSize = Number.isInteger(pageSizeParam) && pageSizeParam >= 1 && pageSizeParam <= 100 ? pageSizeParam : 10

  const conditions = [eq(bookings.tenantId, tenant.id)]
  if (status) conditions.push(eq(bookings.status, status as BookingStatus))
  if (sp.get('boatId')) conditions.push(eq(bookings.boatId, sp.get('boatId') as string))
  if (sp.get('customerId')) conditions.push(eq(bookings.customerId, sp.get('customerId') as string))
  if (dateFrom) conditions.push(gte(bookings.startAt, dateFrom))
  if (dateTo) conditions.push(lte(bookings.endAt, dateTo))
  const q = sp.get('q')?.trim()
  if (q) conditions.push(like(bookings.notes, `%${q}%`))
  const where = and(...conditions)

  const countRows = await db.select({ c: sql<number>`count(*)` }).from(bookings).where(where)
  const total = Number(countRows[0]?.c ?? 0)

  const sort = sp.get('sort') ?? 'start_desc'
  let orderBy = desc(bookings.startAt)
  if (sort === 'start_asc') orderBy = asc(bookings.startAt)
  if (sort === 'created_desc') orderBy = desc(bookings.createdAt)

  const items = await db
    .select()
    .from(bookings)
    .where(where)
    .orderBy(orderBy)
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  const boatIds = [...new Set(items.map((b) => b.boatId))]
  const customerIds = [...new Set(items.map((b) => b.customerId).filter((v): v is string => v !== null && v !== undefined))]

  const boatNames = new Map<string, string>()
  if (boatIds.length > 0) {
    const rows = await db
      .select({ id: boats.id, name: boats.name })
      .from(boats)
      .where(and(eq(boats.tenantId, tenant.id), inArray(boats.id, boatIds)))
    rows.forEach((r) => boatNames.set(r.id, r.name))
  }

  const customerNames = new Map<string, string>()
  if (customerIds.length > 0) {
    const rows = await db
      .select({ id: customers.id, name: customers.name })
      .from(customers)
      .where(and(eq(customers.tenantId, tenant.id), inArray(customers.id, customerIds)))
    rows.forEach((r) => customerNames.set(r.id, r.name))
  }

  const enriched = items.map((b) => ({
    ...b,
    boatName: boatNames.get(b.boatId) ?? null,
    customerName: b.customerId ? customerNames.get(b.customerId) ?? null : null,
  }))

  return NextResponse.json({ items: enriched, total, page, pageSize })
}

export async function POST(request: NextRequest) {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  if (typeof raw !== 'object' || raw === null) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const body = raw as BookingCreateBody

  if (typeof body.tenantSlug !== 'string' || !body.tenantSlug) {
    return NextResponse.json({ error: 'tenantSlug is required' }, { status: 400 })
  }
  const tenant = await resolveTenantBySlug(body.tenantSlug)
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  }

  if (typeof body.boatId !== 'string' || !body.boatId) {
    return NextResponse.json({ error: 'boatId is required' }, { status: 400 })
  }
  const boatRows = await db
    .select()
    .from(boats)
    .where(and(eq(boats.id, body.boatId), eq(boats.tenantId, tenant.id)))
    .limit(1)
  const boat = boatRows[0]
  if (!boat) {
    return NextResponse.json({ error: 'Boat not found' }, { status: 400 })
  }

  const startAt = toIsoDate(body.startAt)
  const endAt = toIsoDate(body.endAt)
  if (!startAt || !endAt) {
    return NextResponse.json({ error: 'startAt and endAt are required and must be valid dates' }, { status: 400 })
  }
  if (endAt <= startAt) {
    return NextResponse.json({ error: 'endAt must be after startAt' }, { status: 400 })
  }

  let customerId: string | null = null
  if (body.customerId !== undefined && body.customerId !== null) {
    if (typeof body.customerId !== 'string' || !body.customerId) {
      return NextResponse.json({ error: 'customerId must be a string' }, { status: 400 })
    }
    const customerRows = await db
      .select({ id: customers.id })
      .from(customers)
      .where(and(eq(customers.id, body.customerId), eq(customers.tenantId, tenant.id)))
      .limit(1)
    if (!customerRows[0]) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 400 })
    }
    customerId = body.customerId
  }

  let crewIds: string[] = []
  if (body.crewIds !== undefined) {
    if (!Array.isArray(body.crewIds) || body.crewIds.some((c) => typeof c !== 'string')) {
      return NextResponse.json({ error: 'crewIds must be an array of strings' }, { status: 400 })
    }
    crewIds = body.crewIds as string[]
    if (crewIds.length > 0) {
      const crewRows = await db
        .select({ id: crewMembers.id })
        .from(crewMembers)
        .where(and(eq(crewMembers.tenantId, tenant.id), inArray(crewMembers.id, crewIds)))
      if (crewRows.length !== crewIds.length) {
        return NextResponse.json({ error: 'One or more crew members not found' }, { status: 400 })
      }
    }
  }

  let status: BookingStatus = 'pending'
  if (body.status !== undefined) {
    if (typeof body.status !== 'string' || !STATUSES.includes(body.status as BookingStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    status = body.status as BookingStatus
  }

  let totalPrice: number | null = null
  if (body.totalPrice !== undefined && body.totalPrice !== null) {
    const price = Number(body.totalPrice)
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: 'totalPrice must be a non-negative number' }, { status: 400 })
    }
    totalPrice = price
  }

  let notes: string | null = null
  if (body.notes !== undefined) {
    if (typeof body.notes !== 'string') {
      return NextResponse.json({ error: 'notes must be a string' }, { status: 400 })
    }
    notes = body.notes.trim() || null
  }

  let createdBy: string | null = null
  if (body.createdBy !== undefined) {
    if (typeof body.createdBy !== 'string') {
      return NextResponse.json({ error: 'createdBy must be a string' }, { status: 400 })
    }
    createdBy = body.createdBy
  }

  const conflict = await findBoatConflict(tenant.id, body.boatId, startAt, endAt, null)
  if (conflict) {
    return NextResponse.json(
      {
        error: 'Boat is not available in the selected period',
        conflict: {
          id: conflict.id,
          startAt: conflict.startAt,
          endAt: conflict.endAt,
          status: conflict.status,
        },
      },
      { status: 409 }
    )
  }

  const now = new Date().toISOString()
  const inserted = await db
    .insert(bookings)
    .values({
      id: uuidv4(),
      tenantId: tenant.id,
      boatId: body.boatId,
      customerId,
      crewIds,
      status,
      startAt,
      endAt,
      totalPrice,
      notes,
      createdBy,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
  const created = inserted[0]

  return NextResponse.json({ ...created, boatName: boat.name }, { status: 201 })
}
