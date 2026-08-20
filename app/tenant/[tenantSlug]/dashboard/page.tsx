import { db, rawClient } from '@/lib/db/client'
import { TenantWrapper } from '@/components/layout/TenantWrapper'
import type { TenantContext } from '@/types'

interface DashboardPageProps {
  params: Promise<{ tenantSlug: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  try {
    const { tenantSlug } = await params

    const result = await rawClient.execute('SELECT * FROM tenants WHERE slug = ?', [tenantSlug])
    const tenant = result.rows[0]

    if (!tenant) {
      return <div className="p-8">Tenant not found</div>
    }

    const tenantContext: TenantContext = {
      id: (tenant as any).id,
      slug: (tenant as any).slug,
      name: (tenant as any).name,
      features: JSON.parse((tenant as any).features),
      branding: JSON.parse((tenant as any).branding),
    }

    const boatsResult = await rawClient.execute(
      'SELECT COUNT(*) as count FROM boats WHERE tenant_id = ?',
      [tenantContext.id]
    )
    const boatsCount = Number((boatsResult.rows[0] as any)?.count ?? 0)

    const pendingResult = await rawClient.execute(
      "SELECT COUNT(*) as count FROM bookings WHERE tenant_id = ? AND status = 'pending'",
      [tenantContext.id]
    )
    const pendingBookings = Number((pendingResult.rows[0] as any)?.count ?? 0)

    return (
      <TenantWrapper tenant={tenantContext}>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total de Barcos" value={boatsCount} color="bg-blue-500" />
            <StatCard title="Reservas Pendentes" value={pendingBookings} color="bg-yellow-500" />
            <StatCard title="Tripulação" value={0} color="bg-green-500" />
          </div>
        </div>
      </TenantWrapper>
    )
  } catch (error) {
    console.error('Dashboard error:', error)
    return <div className="p-8">Error loading dashboard</div>
  }
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className={`w-3 h-3 rounded-full ${color} mb-4`} />
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  )
}
