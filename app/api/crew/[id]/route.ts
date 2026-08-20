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
  const result = await rawClient.execute('SELECT * FROM crew_members WHERE id = ?', [id])

  if (!result.rows[0]) {
    return NextResponse.json({ error: 'Crew member not found' }, { status: 404 })
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
  const { role, boatIds, isActive } = body

  const updateFields: string[] = []
  const params: any[] = []

  if (role) {
    updateFields.push('role = ?')
    params.push(role)
  }
  if (boatIds) {
    updateFields.push('boat_ids = ?')
    params.push(JSON.stringify(boatIds))
  }
  if (isActive !== undefined) {
    updateFields.push('is_active = ?')
    params.push(isActive ? 1 : 0)
  }

  if (updateFields.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  params.push(id)
  await rawClient.execute(`UPDATE crew_members SET ${updateFields.join(', ')} WHERE id = ?`, params)

  const result = await rawClient.execute('SELECT * FROM crew_members WHERE id = ?', [id])
  return NextResponse.json(result.rows[0])
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  await rawClient.execute('DELETE FROM crew_members WHERE id = ?', [id])
  return NextResponse.json({ success: true })
}
