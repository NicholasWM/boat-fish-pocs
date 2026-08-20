import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db/client'
import { tenants, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { compare } from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isValid = await compare(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Account deactivated' }, { status: 403 })
    }

    const [tenant] = await db.select()
      .from(tenants)
      .where(eq(tenants.id, user.tenantId))
      .limit(1)

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 500 })
    }

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      tenantName: tenant.name,
      features: tenant.features,
      branding: tenant.branding,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
