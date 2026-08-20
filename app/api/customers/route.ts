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
    'SELECT * FROM customers WHERE tenant_id = ? ORDER BY created_at DESC',
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
  const { name, email, phone, document, notes } = body

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const { v4: uuidv4 } = await import('uuid')
  const now = new Date().toISOString()
  const id = uuidv4()

  const insertSql = `INSERT INTO customers (id, tenant_id, name, email, phone, document, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  await rawClient.execute(insertSql, [id, tenantId, name, email ?? null, phone ?? null, document ?? null, notes ?? null, now])

  const result = await rawClient.execute('SELECT * FROM customers WHERE id = ?', [id])
  return NextResponse.json(result.rows[0], { status: 201 })
}
