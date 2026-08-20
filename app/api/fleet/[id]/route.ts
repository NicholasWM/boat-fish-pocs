import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'
import { db } from '@/lib/db/client'
import { boats } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const { tenantId } = session.user as any

  const [boat] = await db.select()
    .from(boats)
    .where(eq(boats.id, id))
    .limit(1)

  if (!boat || boat.tenantId !== tenantId) {
    return NextResponse.json({ error: 'Boat not found' }, { status: 404 })
  }

  return NextResponse.json(boat)
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const { tenantId } = session.user as any
  const body = await request.json()

  const [existing] = await db.select()
    .from(boats)
    .where(eq(boats.id, id))
    .limit(1)

  if (!existing || existing.tenantId !== tenantId) {
    return NextResponse.json({ error: 'Boat not found' }, { status: 404 })
  }

  const [boat] = await db.update(boats)
    .set({
      name: body.name ?? existing.name,
      type: body.type ?? existing.type,
      capacity: body.capacity ?? existing.capacity,
      description: body.description ?? existing.description,
      status: body.status ?? existing.status,
      pricing: body.pricing ? JSON.stringify(body.pricing) : existing.pricing,
      features: body.features ? JSON.stringify(body.features) : existing.features,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(boats.id, id))
    .returning()

  return NextResponse.json(boat)
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const { tenantId } = session.user as any

  const [existing] = await db.select()
    .from(boats)
    .where(eq(boats.id, id))
    .limit(1)

  if (!existing || existing.tenantId !== tenantId) {
    return NextResponse.json({ error: 'Boat not found' }, { status: 404 })
  }

  await db.delete(boats).where(eq(boats.id, id))

  return NextResponse.json({ success: true })
}
