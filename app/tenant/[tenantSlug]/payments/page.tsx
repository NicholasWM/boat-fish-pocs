import { db, rawClient } from '@/lib/db/client'
import { tenants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { TenantWrapper } from '@/components/layout/TenantWrapper'
import Link from 'next/link'
import type { TenantContext } from '@/types'

interface PaymentsPageProps {
  params: Promise<{ tenantSlug: string }>
}

export default async function PaymentsPage({ params }: PaymentsPageProps) {
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

  const result = await rawClient.execute(`
    SELECT p.*, b.boat_id, c.name as customer_name 
    FROM payments p 
    LEFT JOIN bookings b ON p.booking_id = b.id
    LEFT JOIN customers c ON b.customer_id = c.id
    WHERE p.tenant_id = ? 
    ORDER BY p.created_at DESC
  `, [tenant.id])
  const payments = result.rows

  const totalReceived = payments.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + Number(p.amount), 0)
  const totalPending = payments.filter((p: any) => p.status === 'pending').reduce((sum: number, p: any) => sum + Number(p.amount), 0)

  return (
    <TenantWrapper tenant={tenantContext}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Pagamentos</h1>
          <Link href={`/tenant/${tenantSlug}/payments/new`} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            Novo Pagamento
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-500">Total Recebido</p>
            <p className="text-3xl font-bold text-green-600 mt-1">R$ {totalReceived.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-500">Total Pendente</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">R$ {totalPending.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-500">Total de Pagamentos</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{payments.length}</p>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-12 text-slate-500"><p>Nenhum pagamento registrado</p></div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Booking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Método</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {payments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900">{payment.boat_id ?? 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{payment.customer_name ?? 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">R$ {Number(payment.amount).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        payment.status === 'refunded' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 capitalize">{payment.method}</td>
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
