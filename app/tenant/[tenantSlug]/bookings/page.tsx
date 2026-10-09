import { db, rawClient } from '@/lib/db/client'
import { tenants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { TenantWrapper } from '@/components/layout/TenantWrapper'
import Link from 'next/link'
import type { TenantContext } from '@/types'

interface BookingsPageProps {
  params: Promise<{ tenantSlug: string }>
}

export default async function BookingsPage({ params }: BookingsPageProps) {
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

  const result = await rawClient.execute(
    'SELECT b.*, br.name as boat_name, c.name as customer_name FROM bookings b LEFT JOIN boats br ON b.boat_id = br.id LEFT JOIN customers c ON b.customer_id = c.id WHERE b.tenant_id = ? ORDER BY b.created_at DESC',
    [tenant.id]
  )
  const bookings = result.rows

  return (
    <TenantWrapper tenant={tenantContext}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Reservas</h1>
          <Link
            href={`/tenant/${tenantSlug}/bookings/new`}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Nova Reserva
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>Nenhuma reserva encontrada</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Barco</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {bookings.map((booking: any) => (
                  <tr key={booking.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">{booking.boat_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{booking.customer_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{(booking.start_at as string)?.split('T')[0]}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">R$ {booking.total_price ?? '0'}</td>
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
