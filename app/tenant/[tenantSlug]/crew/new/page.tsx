import { db, rawClient } from '@/lib/db/client'
import { tenants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { TenantWrapper } from '@/components/layout/TenantWrapper'
import { CrewForm } from '../CrewForm'
import Link from 'next/link'
import type { TenantContext } from '@/types'

interface NewCrewPageProps {
  params: Promise<{ tenantSlug: string }>
}

export default async function NewCrewPage({ params }: NewCrewPageProps) {
  const { tenantSlug } = await params
  const tenant = await db.select().from(tenants).where(eq(tenants.slug, tenantSlug)).limit(1).then(r => r[0])

  if (!tenant) return <div className="p-8">Tenant not found</div>

  const tenantContext: TenantContext = {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    features: JSON.parse(tenant.features as string),
    branding: JSON.parse(tenant.branding as string),
  }

  return (
    <TenantWrapper tenant={tenantContext}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Novo Membro da Tripulação</h1>
        <CrewForm tenant={tenantContext} />
      </div>
    </TenantWrapper>
  )
}
