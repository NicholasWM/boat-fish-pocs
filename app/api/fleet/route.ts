import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'
import { db } from '@/lib/db/client'
import { boats } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { tenantId } = session.user as any

  const boatsList = await db.select()
    .from(boats)
    .where(eq(boats.tenantId, tenantId))
    .orderBy(boats.createdAt)

  return NextResponse.json(boatsList)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { tenantId } = session.user as any
  const body = await request.json()

  const { name, type, capacity, description, status, pricing, features } = body

  if (!name || !type || !capacity) {
    return NextResponse.json({ error: 'name, type and capacity are required' }, { status: 400 })
  }

  const { v4: uuidv4 } = await import('uuid')
  const boatId = uuidv4()
  const now = new Date().toISOString()
  const [boat] = await db.insert(boats).values({
    id: boatId,
    tenantId,
    name,
    type: type as any,
    capacity,
    description: description ?? null,
    status: status ?? 'active',
    pricing: JSON.stringify(pricing ?? {}),
    features: JSON.stringify(features ?? []),
    createdAt: now,
    updatedAt: now,
  }).returning()

  return NextResponse.json(boat, { status: 201 })
}
