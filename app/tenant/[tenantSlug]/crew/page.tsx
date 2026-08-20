import { db, rawClient } from '@/lib/db/client'
import { tenants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { TenantWrapper } from '@/components/layout/TenantWrapper'
import Link from 'next/link'
import type { TenantContext } from '@/types'

interface CrewPageProps {
  params: Promise<{ tenantSlug: string }>
}

export default async function CrewPage({ params }: CrewPageProps) {
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

  const result = await rawClient.execute('SELECT * FROM crew_members WHERE tenant_id = ? ORDER BY created_at DESC', [tenant.id])
  const crew = result.rows

  return (
    <TenantWrapper tenant={tenantContext}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Tripulação</h1>
          <Link href={`/tenant/${tenantSlug}/crew/new`} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            Novo Membro
          </Link>
        </div>

        {crew.length === 0 ? (
          <div className="text-center py-12 text-slate-500"><p>Nenhum membro da tripulação</p></div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Função</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {crew.map((member: any) => (
                  <tr key={member.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900">{member.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{member.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 capitalize">{member.role.replace('_', ' ')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${member.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
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
