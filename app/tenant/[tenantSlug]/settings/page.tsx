import { db } from '@/lib/db/client'
import { tenants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { TenantWrapper } from '@/components/layout/TenantWrapper'
import type { TenantContext } from '@/types'

interface PageProps {
  params: Promise<{ tenantSlug: string }>
}

export default async function Page({ params }: PageProps) {
  const { tenantSlug } = await params

  const tenant = await db.select()
    .from(tenants)
    .where(eq(tenants.slug, tenantSlug))
    .limit(1)
    .then(r => r[0])

  if (!tenant) {
    return <div className="p-8">Tenant not found</div>
  }

  const tenantContext: TenantContext = {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    features: tenant.features as Record<string, boolean>,
    branding: tenant.branding as TenantContext['branding'],
  }

  return (
    <TenantWrapper tenant={tenantContext}>
      <h1 className="text-3xl font-bold text-slate-900 capitalize">{tenantSlug}</h1>
      <p className="text-slate-500 mt-4">Em breve</p>
    </TenantWrapper>
  )
}
