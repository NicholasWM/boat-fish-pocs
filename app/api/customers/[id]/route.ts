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
  const result = await rawClient.execute('SELECT * FROM customers WHERE id = ?', [id])

  if (!result.rows[0]) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
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
  const { name, email, phone, document, notes } = body

  const updateFields: string[] = []
  const params: any[] = []

  if (name) { updateFields.push('name = ?'); params.push(name) }
  if (email) { updateFields.push('email = ?'); params.push(email) }
  if (phone) { updateFields.push('phone = ?'); params.push(phone) }
  if (document) { updateFields.push('document = ?'); params.push(document) }
  if (notes !== undefined) { updateFields.push('notes = ?'); params.push(notes) }

  if (updateFields.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  params.push(id)
  await rawClient.execute(`UPDATE customers SET ${updateFields.join(', ')} WHERE id = ?`, params)

  const result = await rawClient.execute('SELECT * FROM customers WHERE id = ?', [id])
  return NextResponse.json(result.rows[0])
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  await rawClient.execute('DELETE FROM customers WHERE id = ?', [id])
  return NextResponse.json({ success: true })
}
