import { db, rawClient } from '@/lib/db/client'
import { tenants, boats } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { TenantWrapper } from '@/components/layout/TenantWrapper'
import Link from 'next/link'
import type { TenantContext } from '@/types'

interface FleetPageProps {
  params: Promise<{ tenantSlug: string }>
  searchParams: Promise<{ type?: string; status?: string; search?: string }>
}

export default async function FleetPage({ params, searchParams }: FleetPageProps) {
  const { tenantSlug } = await params
  const { type, status, search } = await searchParams

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
    features: JSON.parse(tenant.features as string),
    branding: JSON.parse(tenant.branding as string),
  }

  // Use raw SQL for SQLite due to type inference issues
  let sql = 'SELECT * FROM boats WHERE tenant_id = ?'
  const queryParams: any[] = [tenant.id]

  if (type) {
    sql += ' AND type = ?'
    queryParams.push(type)
  }
  if (status) {
    sql += ' AND status = ?'
    queryParams.push(status)
  }
  if (search) {
    sql += ' AND name LIKE ?'
    queryParams.push(`%${search}%`)
  }

  sql += ' ORDER BY created_at DESC'

  const result = await rawClient.execute(sql, queryParams)
  const boatsList = result.rows as any[]

  return (
    <TenantWrapper tenant={tenantContext}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Frota</h1>
          <Link
            href={`/tenant/${tenantSlug}/fleet/new`}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Novo Barco
          </Link>
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Buscar por nome..."
            defaultValue={search}
            className="px-4 py-2 border border-slate-300 rounded-lg"
          />
          <select
            defaultValue={type}
            className="px-4 py-2 border border-slate-300 rounded-lg"
          >
            <option value="">Todos os tipos</option>
            <option value="pesca">Pesca</option>
            <option value="passeio">Passeio</option>
            <option value="luxury">Luxury</option>
            <option value="fishing">Fishing</option>
          </select>
          <select
            defaultValue={status}
            className="px-4 py-2 border border-slate-300 rounded-lg"
          >
            <option value="">Todos os status</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {boatsList.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>Nenhum barco cadastrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boatsList.map((boat) => (
              <div
                key={boat.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">{boat.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    boat.status === 'active' ? 'bg-green-100 text-green-700' :
                    boat.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {boat.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {boat.type} · Capacidade: {boat.capacity} pessoas
                </p>
                {boat.description && (
                  <p className="text-sm text-slate-600 mt-3 line-clamp-3">
                    {boat.description}
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/tenant/${tenantSlug}/fleet/${boat.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TenantWrapper>
  )
}
