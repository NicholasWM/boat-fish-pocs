import { db } from '@/lib/db/client'
import { tenants, boats } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { TenantWrapper } from '@/components/layout/TenantWrapper'
import { BoatForm } from '../BoatForm'
import type { TenantContext } from '@/types'

interface EditBoatPageProps {
  params: Promise<{ tenantSlug: string; id: string }>
}

export default async function EditBoatPage({ params }: EditBoatPageProps) {
  const { tenantSlug, id } = await params

  const tenant = await db.select()
    .from(tenants)
    .where(eq(tenants.slug, tenantSlug))
    .limit(1)
    .then(r => r[0])

  if (!tenant) {
    return <div className="p-8">Tenant not found</div>
  }

  const [boat] = await db.select()
    .from(boats)
    .where(eq(boats.id, id))
    .limit(1)

  if (!boat) {
    return <div className="p-8">Boat not found</div>
  }

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
        <h1 className="text-3xl font-bold text-slate-900">Editar Barco</h1>
        <BoatForm tenant={tenantContext} initialData={boat} isEdit />
      </div>
    </TenantWrapper>
  )
}
