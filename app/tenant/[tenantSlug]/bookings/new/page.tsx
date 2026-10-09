import { db, rawClient } from '@/lib/db/client'
import { tenants, boats, customers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { TenantWrapper } from '@/components/layout/TenantWrapper'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid'
import type { TenantContext } from '@/types'

interface NewBookingPageProps {
  params: Promise<{ tenantSlug: string }>
}

export default async function NewBookingPage({ params }: NewBookingPageProps) {
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
    features: JSON.parse(tenant.features as string),
    branding: JSON.parse(tenant.branding as string),
  }

  const boatsResult = await rawClient.execute(
    'SELECT * FROM boats WHERE tenant_id = ? AND status = "active"',
    [tenant.id]
  )
  const boatsList = boatsResult.rows

  const customersResult = await rawClient.execute(
    'SELECT * FROM customers WHERE tenant_id = ?',
    [tenant.id]
  )
  const customersList = customersResult.rows

  return (
    <TenantWrapper tenant={tenantContext}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/tenant/${tenantSlug}/bookings`} className="text-slate-500 hover:text-slate-700">
            ← Voltar
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Nova Reserva</h1>
        </div>

        <form className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Barco *</label>
              <select required className="w-full px-4 py-2 border border-slate-300 rounded-lg">
                <option value="">Selecione...</option>
                {boatsList.map((boat: any) => (
                  <option key={boat.id} value={boat.id}>{boat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente *</label>
              <select required className="w-full px-4 py-2 border border-slate-300 rounded-lg">
                <option value="">Selecione...</option>
                {customersList.map((customer: any) => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data Início *</label>
              <input type="datetime-local" required className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data Fim *</label>
              <input type="datetime-local" required className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor Total (R$)</label>
              <input type="number" step="0.01" className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select className="w-full px-4 py-2 border border-slate-300 rounded-lg">
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmada</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
            <textarea rows={4} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
          </div>

          <div className="flex gap-4">
            <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
              Criar Reserva
            </button>
            <Link href={`/tenant/${tenantSlug}/bookings`} className="px-6 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </TenantWrapper>
  )
}
