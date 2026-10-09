import { rawClient } from '@/lib/db/client'

interface PublicBoatPageProps {
  params: Promise<{ tenantSlug: string }>
}

export default async function PublicBoatPage({ params }: PublicBoatPageProps) {
  const { tenantSlug } = await params

  const result = await rawClient.execute('SELECT * FROM tenants WHERE slug = ?', [tenantSlug])
  const tenant = result.rows[0] as any

  if (!tenant) {
    return <div className="min-h-screen flex items-center justify-center">Tenant not found</div>
  }

  const boatsResult = await rawClient.execute(
    'SELECT * FROM boats WHERE tenant_id = ? AND status = "active" ORDER BY created_at DESC',
    [tenant.id]
  )
  const boatsList = boatsResult.rows as any[]

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{tenant.name}</h1>
              <p className="text-slate-600 mt-1">Locação de Barcos</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Contato</p>
              <p className="text-lg font-semibold text-primary">11 99999-0000</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Nossos Barcos</h2>

        {boatsList.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>Nenhum barco disponível no momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {boatsList.map((boat) => (
              <BoatCard key={boat.id} boat={boat} tenantSlug={tenant.slug} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; {new Date().getFullYear()} {tenant.name}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

function BoatCard({ boat, tenantSlug }: { boat: any; tenantSlug: string }) {
  const pricing = JSON.parse(boat.pricing || '{}')
  const features = JSON.parse(boat.features || '[]')

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="h-48 bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
        <span className="text-6xl">🚤</span>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold text-slate-900">{boat.name}</h3>
          <span className="px-3 py-1 text-xs font-medium bg-cyan-100 text-cyan-800 rounded-full capitalize">
            {boat.type}
          </span>
        </div>
        
        <p className="text-slate-600 mt-2">{boat.description}</p>
        
        <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <span>👥</span> {boat.capacity} pessoas
          </span>
          <span className="flex items-center gap-1">
            <span>⚡</span> {features.length} equipamentos
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-2xl font-bold text-primary">
            R$ {pricing.basePrice || 0}
            <span className="text-sm font-normal text-slate-500">/dia</span>
          </p>
          {pricing.perHour && (
            <p className="text-sm text-slate-500">
              R$ {pricing.perHour}/hora · Mín. {pricing.minHours || 1}h
            </p>
          )}
        </div>

        <a
          href={`https://wa.me/5511999999999?text=Olá! Tenho interesse no barco ${boat.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block w-full text-center bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Reservar via WhatsApp
        </a>
      </div>
    </div>
  )
}
