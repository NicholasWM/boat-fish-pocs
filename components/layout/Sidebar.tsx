'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { TenantFeatures } from '@/types'
import { hasFeature } from '@/lib/tenant/features'

interface NavItem {
  label: string
  href: string
  feature: string
}

interface SidebarProps {
  companyName: string
  logoUrl?: string
  features: Record<string, boolean>
  navItems: NavItem[]
  currentPath: string
}

export function Sidebar({ companyName, logoUrl, features, navItems, currentPath }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-slate-700">
        {logoUrl && (
          <img src={logoUrl} alt={companyName} className="h-10 mb-2" />
        )}
        <h2 className="text-lg font-semibold truncate">{companyName}</h2>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          if (!hasFeature(features, item.feature as any)) return null

          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <Link
          href={`/tenant/${currentPath.split('/')[2] || 'demo'}/settings`}
          className="block px-4 py-2 text-slate-300 hover:text-white transition-colors"
        >
          Configurações
        </Link>
      </div>
    </aside>
  )
}
