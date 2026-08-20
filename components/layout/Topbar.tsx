'use client'

interface TopbarProps {
  companyName: string
  logoUrl?: string
}

export function Topbar({ companyName, logoUrl }: TopbarProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        {logoUrl && (
          <img src={logoUrl} alt={companyName} className="h-8" />
        )}
        <span className="text-lg font-semibold text-slate-800">{companyName}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
          U
        </div>
      </div>
    </header>
  )
}
