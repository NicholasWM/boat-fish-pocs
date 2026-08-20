import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return { error: 'Unauthorized', status: 401 }
  }
  return { user: session.user, session }
}

export async function requireTenant(session: any) {
  if (!session?.tenantId) {
    return { error: 'Tenant required', status: 400 }
  }
  return { tenantId: session.tenantId }
}
