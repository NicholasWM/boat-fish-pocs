import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'
import { db, rawClient } from '@/lib/db/client'
import { crewMembers } from '@/lib/db/schema'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { tenantId } = session.user as any
  const result = await rawClient.execute(
    'SELECT * FROM crew_members WHERE tenant_id = ? ORDER BY created_at DESC',
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
  const { name, email, role, boatIds } = body

  if (!name || !email || !role) {
    return NextResponse.json({ error: 'name, email and role are required' }, { status: 400 })
  }

  const { v4: uuidv4 } = await import('uuid')
  const now = new Date().toISOString()
  const id = uuidv4()

  const insertSql = `INSERT INTO crew_members (id, tenant_id, user_id, boat_ids, role, is_active, created_at) VALUES (?, ?, NULL, ?, ?, 1, ?)`
  await rawClient.execute(insertSql, [id, tenantId, JSON.stringify(boatIds ?? []), role, now])

  const result = await rawClient.execute('SELECT * FROM crew_members WHERE id = ?', [id])
  return NextResponse.json(result.rows[0], { status: 201 })
}
