import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'
import { rawClient } from '@/lib/db/client'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { tenantId } = session.user as any
  const result = await rawClient.execute(
    `SELECT p.*, b.boat_id, c.name as customer_name 
     FROM payments p 
     LEFT JOIN bookings b ON p.booking_id = b.id
     LEFT JOIN customers c ON b.customer_id = c.id
     WHERE p.tenant_id = ? 
     ORDER BY p.created_at DESC`,
    [tenantId]
  )
  return NextResponse.json(result.rows)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { tenantId } = session.user as any
  const body = await request.json()
  const { bookingId, amount, method, dueAt } = body

  if (!amount || !method || !dueAt) {
    return NextResponse.json({ error: 'amount, method and dueAt are required' }, { status: 400 })
  }

  const { v4: uuidv4 } = await import('uuid')
  const now = new Date().toISOString()
  const id = uuidv4()

  const insertSql = `INSERT INTO payments (id, tenant_id, booking_id, amount, status, method, paid_at, due_at, notes, created_at) VALUES (?, ?, ?, ?, 'pending', ?, NULL, ?, NULL, ?)`
  await rawClient.execute(insertSql, [id, tenantId, bookingId ?? null, amount, method, dueAt, now])

  const result = await rawClient.execute('SELECT * FROM payments WHERE id = ?', [id])
  return NextResponse.json(result.rows[0], { status: 201 })
}
