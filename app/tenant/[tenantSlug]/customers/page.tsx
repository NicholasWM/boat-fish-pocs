import { db, rawClient } from '@/lib/db/client'
import { tenants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { TenantWrapper } from '@/components/layout/TenantWrapper'
import Link from 'next/link'
import type { TenantContext } from '@/types'

interface CustomersPageProps {
  params: Promise<{ tenantSlug: string }>
}

export default async function CustomersPage({ params }: CustomersPageProps) {
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

  const result = await rawClient.execute('SELECT * FROM customers WHERE tenant_id = ? ORDER BY created_at DESC', [tenant.id])
  const customers = result.rows

  return (
    <TenantWrapper tenant={tenantContext}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
          <Link href={`/tenant/${tenantSlug}/customers/new`} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            Novo Cliente
          </Link>
        </div>

        {customers.length === 0 ? (
          <div className="text-center py-12 text-slate-500"><p>Nenhum cliente cadastrado</p></div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Telefone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {customers.map((customer: any) => (
                  <tr key={customer.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900">{customer.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{customer.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{customer.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </TenantWrapper>
  )
}
