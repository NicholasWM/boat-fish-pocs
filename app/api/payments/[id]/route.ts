import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'
import { rawClient } from '@/lib/db/client'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const result = await rawClient.execute(
    `SELECT p.*, b.boat_id, c.name as customer_name 
     FROM payments p 
     LEFT JOIN bookings b ON p.booking_id = b.id
     LEFT JOIN customers c ON b.customer_id = c.id
     WHERE p.id = ?`,
    [id]
  )

  if (!result.rows[0]) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  return NextResponse.json(result.rows[0])
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const body = await request.json()
  const { status, paidAt, notes } = body

  const updateFields: string[] = []
  const params: any[] = []

  if (status) {
    updateFields.push('status = ?')
    params.push(status)
    if (status === 'paid') {
      updateFields.push('paid_at = ?')
      params.push(paidAt ?? new Date().toISOString())
    }
  }
  if (notes !== undefined) {
    updateFields.push('notes = ?')
    params.push(notes)
  }

  if (updateFields.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  params.push(id)
  await rawClient.execute(`UPDATE payments SET ${updateFields.join(', ')} WHERE id = ?`, params)

  const result = await rawClient.execute('SELECT * FROM payments WHERE id = ?', [id])
  return NextResponse.json(result.rows[0])
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const payment = await rawClient.execute('SELECT status FROM payments WHERE id = ?', [id])

  if (payment.rows[0]?.status !== 'pending') {
    return NextResponse.json({ error: 'Only pending payments can be deleted' }, { status: 400 })
  }

  await rawClient.execute('DELETE FROM payments WHERE id = ?', [id])
  return NextResponse.json({ success: true })
}
