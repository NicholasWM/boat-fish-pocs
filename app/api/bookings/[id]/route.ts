import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { and, eq, gt, inArray, lt, ne } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { boats, bookings, customers, crewMembers, tenants } from '@/lib/db/schema'
import type { Booking } from '@/types'

type BookingStatus = Booking['status']

const STATUSES: BookingStatus[] = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
const ACTIVE_STATUSES: BookingStatus[] = ['confirmed', 'in_progress']
const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled'],
  in_progress: ['completed'],
  completed: [],
  cancelled: [],
}

interface BookingUpdateBody {
  tenantSlug?: unknown
  boatId?: unknown
  customerId?: unknown
  crewIds?: unknown
  status?: unknown
  startAt?: unknown
  endAt?: unknown
  totalPrice?: unknown
  notes?: unknown
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  if (typeof raw !== 'object' || raw === null) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const body = raw as BookingUpdateBody

  if (typeof body.tenantSlug !== 'string' || !body.tenantSlug) {
    return NextResponse.json({ error: 'tenantSlug is required' }, { status: 400 })
  }
  const tenant = await resolveTenantBySlug(body.tenantSlug)
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  }

  const existingRows = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.id, id), eq(bookings.tenantId, tenant.id)))
    .limit(1)
  const existing = existingRows[0]
  if (!existing) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  let boatId = existing.boatId
  if (body.boatId !== undefined) {
    if (typeof body.boatId !== 'string' || !body.boatId) {
      return NextResponse.json({ error: 'boatId must be a string' }, { status: 400 })
    }
    const boatRows = await db
      .select()
      .from(boats)
      .where(and(eq(boats.id, body.boatId), eq(boats.tenantId, tenant.id)))
      .limit(1)
    if (!boatRows[0]) {
      return NextResponse.json({ error: 'Boat not found' }, { status: 400 })
    }
    boatId = body.boatId
  }

  let customerId = existing.customerId
  if (body.customerId !== undefined) {
    if (body.customerId === null) {
      customerId = null
    } else {
      if (typeof body.customerId !== 'string' || !body.customerId) {
        return NextResponse.json({ error: 'customerId must be a string or null' }, { status: 400 })
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
  }

  let crewIds = existing.crewIds
  if (body.crewIds !== undefined) {
    if (!Array.isArray(body.crewIds) || body.crewIds.some((c) => typeof c !== 'string')) {
      return NextResponse.json({ error: 'crewIds must be an array of strings' }, { status: 400 })
    }
    const nextCrewIds = body.crewIds as string[]
    if (nextCrewIds.length > 0) {
      const crewRows = await db
        .select({ id: crewMembers.id })
        .from(crewMembers)
        .where(and(eq(crewMembers.tenantId, tenant.id), inArray(crewMembers.id, nextCrewIds)))
      if (crewRows.length !== nextCrewIds.length) {
        return NextResponse.json({ error: 'One or more crew members not found' }, { status: 400 })
      }
    }
    crewIds = nextCrewIds
  }

  let status = existing.status
  if (body.status !== undefined) {
    if (typeof body.status !== 'string' || !STATUSES.includes(body.status as BookingStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    const nextStatus = body.status as BookingStatus
    if (nextStatus !== existing.status && !TRANSITIONS[existing.status].includes(nextStatus)) {
      return NextResponse.json(
        {
          error: `Invalid status transition from '${existing.status}' to '${nextStatus}'`,
          allowed: TRANSITIONS[existing.status],
        },
        { status: 409 }
      )
    }
    status = nextStatus
  }

  let startAt = existing.startAt
  if (body.startAt !== undefined) {
    const parsed = toIsoDate(body.startAt)
    if (!parsed) {
      return NextResponse.json({ error: 'startAt must be a valid date' }, { status: 400 })
    }
    startAt = parsed
  }

  let endAt = existing.endAt
  if (body.endAt !== undefined) {
    const parsed = toIsoDate(body.endAt)
    if (!parsed) {
      return NextResponse.json({ error: 'endAt must be a valid date' }, { status: 400 })
    }
    endAt = parsed
  }

  if (endAt <= startAt) {
    return NextResponse.json({ error: 'endAt must be after startAt' }, { status: 400 })
  }

  let totalPrice = existing.totalPrice
  if (body.totalPrice !== undefined) {
    if (body.totalPrice === null) {
      totalPrice = null
    } else {
      const price = Number(body.totalPrice)
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ error: 'totalPrice must be a non-negative number or null' }, { status: 400 })
      }
      totalPrice = price
    }
  }

  let notes = existing.notes
  if (body.notes !== undefined) {
    if (body.notes === null) {
      notes = null
    } else {
      if (typeof body.notes !== 'string') {
        return NextResponse.json({ error: 'notes must be a string or null' }, { status: 400 })
      }
      notes = body.notes.trim() || null
    }
  }

  const scheduleChanged = boatId !== existing.boatId || startAt !== existing.startAt || endAt !== existing.endAt
  if (scheduleChanged) {
    const conflict = await findBoatConflict(tenant.id, boatId, startAt, endAt, existing.id)
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
  }

  const now = new Date().toISOString()
  await db
    .update(bookings)
    .set({
      boatId,
      customerId,
      crewIds,
      status,
      startAt,
      endAt,
      totalPrice,
      notes,
      updatedAt: now,
    })
    .where(and(eq(bookings.id, id), eq(bookings.tenantId, tenant.id)))

  return NextResponse.json({
    ...existing,
    boatId,
    customerId,
    crewIds,
    status,
    startAt,
    endAt,
    totalPrice,
    notes,
    updatedAt: now,
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let tenantSlug: string | null = null
  try {
    const raw = await request.json()
    if (typeof raw === 'object' && raw !== null && typeof (raw as { tenantSlug?: unknown }).tenantSlug === 'string') {
      tenantSlug = (raw as { tenantSlug: string }).tenantSlug
    }
  } catch {
    tenantSlug = request.nextUrl.searchParams.get('tenantSlug')
  }
  if (!tenantSlug) {
    tenantSlug = request.nextUrl.searchParams.get('tenantSlug')
  }
  if (!tenantSlug) {
    return NextResponse.json({ error: 'tenantSlug is required' }, { status: 400 })
  }

  const tenant = await resolveTenantBySlug(tenantSlug)
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  }

  const existingRows = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.id, id), eq(bookings.tenantId, tenant.id)))
    .limit(1)
  if (!existingRows[0]) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  await db.delete(bookings).where(and(eq(bookings.id, id), eq(bookings.tenantId, tenant.id)))

  return NextResponse.json({ deleted: true, id })
}

async function findBoatConflict(
  tenantId: string,
  boatId: string,
  startAt: string,
  endAt: string,
  excludeId: string
): Promise<Booking | null> {
  const conditions = [
    eq(bookings.tenantId, tenantId),
    eq(bookings.boatId, boatId),
    inArray(bookings.status, ACTIVE_STATUSES),
    lt(bookings.startAt, endAt),
    gt(bookings.endAt, startAt),
    ne(bookings.id, excludeId),
  ]
  const rows = await db.select().from(bookings).where(and(...conditions)).limit(1)
  return rows[0] ?? null
}
