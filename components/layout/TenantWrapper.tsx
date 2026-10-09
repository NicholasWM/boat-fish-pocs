import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import type { TenantContext } from '@/types'

interface TenantWrapperProps {
  tenant: TenantContext
  children: React.ReactNode
}

export function TenantWrapper({ tenant, children }: TenantWrapperProps) {
  const branding = tenant.branding ?? {}
  const features = tenant.features ?? {}
  const tenantSlug = tenant.slug

  const navItems = [
    { label: 'Dashboard', href: `/tenant/${tenantSlug}/dashboard`, feature: 'bookings' as const },
    { label: 'Reservas', href: `/tenant/${tenantSlug}/bookings`, feature: 'bookings' as const },
    { label: 'Frota', href: `/tenant/${tenantSlug}/fleet`, feature: 'fleet' as const },
    { label: 'Tripulação', href: `/tenant/${tenantSlug}/crew`, feature: 'crew' as const },
    { label: 'Pagamentos', href: `/tenant/${tenantSlug}/payments`, feature: 'payments' as const },
    { label: 'Clientes', href: `/tenant/${tenantSlug}/customers`, feature: 'customers' as const },
  ]

  return (
    <div className="flex min-h-screen">
      <Sidebar
        companyName={branding.companyName ?? tenant.name}
        logoUrl={branding.logoUrl}
        features={features}
        navItems={navItems}
        currentPath={''}
        tenantSlug={tenantSlug}
      />
      <div className="flex-1 flex flex-col">
        <Topbar
          companyName={branding.companyName ?? tenant.name}
          logoUrl={branding.logoUrl}
        />
        <main className="flex-1 p-6 bg-surface">{children}</main>
      </div>
    </div>
  )
}
