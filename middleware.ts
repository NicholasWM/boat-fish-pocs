import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { resolveTenant } from '@/lib/tenant/resolver'
import { generateTenantTheme } from '@/lib/branding/theme'
import type { TenantBranding } from '@/types'

const PUBLIC_PATHS = ['/auth/login', '/api/']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/') || pathname.includes('.')) {
    return NextResponse.next()
  }

  const slug = getTenantSlug(pathname)
  
  if (!slug) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const tenant = await resolveTenant(slug)
  
  if (!tenant || !tenant.isActive) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-id', tenant.id)
  requestHeaders.set('x-tenant-slug', tenant.slug)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  const branding = (tenant.branding as TenantBranding | undefined)
  const theme = generateTenantTheme(branding)
  response.headers.set('x-tenant-theme', JSON.stringify(theme))

  return response
}

function getTenantSlug(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean)
  const idx = pathname.indexOf('/tenant/')
  if (idx === -1) return null
  const afterTenant = pathname.slice(idx + '/tenant/'.length)
  const slug = afterTenant.split('/')[0]
  return slug || null
}

export const config = {
  runtime: 'nodejs',
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
