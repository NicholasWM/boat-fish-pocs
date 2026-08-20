import Link from 'next/link'
import { and, desc, eq, gte, inArray, like, lte, sql } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { boats, bookings, customers, tenants } from '@/lib/db/schema'
import { TenantWrapper } from '@/components/layout/TenantWrapper'
import type { Booking, TenantContext } from '@/types'

interface BookingsPageProps {
  params: Promise<{ tenantSlug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'completed', label: 'Concluída' },
  { value: 'cancelled', label: 'Cancelada' },
]

const STATUS_LABELS: Record<Booking['status'], string> = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  in_progress: 'Em andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
}

const STATUS_BADGES: Record<Booking['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-slate-200 text-slate-700',
  cancelled: 'bg-red-100 text-red-700',
}

function firstString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

function toDayStart(value: string): string | null {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

function toDayEnd(value: string): string | null {
  const date = new Date(`${value}T23:59:59`)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function buildQuery(base: string, params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `${base}?${qs}` : base
}

export default async function BookingsPage({ params, searchParams }: BookingsPageProps) {
  const { tenantSlug } = await params
  const sp = await searchParams

  const status = firstString(sp.status)
  const boatId = firstString(sp.boatId)
  const dateFromRaw = firstString(sp.dateFrom)
  const dateToRaw = firstString(sp.dateTo)
  const q = firstString(sp.q)?.trim()
  const page = Math.max(1, Number(firstString(sp.page) ?? '1') || 1)
  const pageSize = 10

  const tenantRows = await db.select().from(tenants).where(eq(tenants.slug, tenantSlug)).limit(1)
  const tenant = tenantRows[0]
  if (!tenant) {
    return <div className="p-8">Tenant not found</div>
  }

  const tenantContext: TenantContext = {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    features: tenant.features as TenantContext['features'],
    branding: tenant.branding as TenantContext['branding'],
  }

  const base = `/${tenant.slug}/bookings`

  const boatsList = await db
    .select({ id: boats.id, name: boats.name })
    .from(boats)
    .where(eq(boats.tenantId, tenant.id))
    .orderBy(desc(boats.createdAt))

  const dateFrom = dateFromRaw ? toDayStart(dateFromRaw) : null
  const dateTo = dateToRaw ? toDayEnd(dateToRaw) : null

  const conditions = [eq(bookings.tenantId, tenant.id)]
  if (status) conditions.push(eq(bookings.status, status as Booking['status']))
  if (boatId) conditions.push(eq(bookings.boatId, boatId))
  if (dateFrom) conditions.push(gte(bookings.startAt, dateFrom))
  if (dateTo) conditions.push(lte(bookings.startAt, dateTo))
  if (q) conditions.push(like(bookings.notes, `%${q}%`))
  const where = and(...conditions)

  const countRows = await db.select({ c: sql<number>`count(*)` }).from(bookings).where(where)
  const total = Number(countRows[0]?.c ?? 0)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const items = await db
    .select()
    .from(bookings)
    .where(where)
    .orderBy(desc(bookings.startAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  const boatNames = new Map(boatsList.map((b) => [b.id, b.name]))
  const customerIds = [...new Set(items.map((b) => b.customerId).filter((v): v is string => v !== null))]
  const customerNames = new Map<string, string>()
  if (customerIds.length > 0) {
    const rows = await db
      .select({ id: customers.id, name: customers.name })
      .from(customers)
      .where(and(eq(customers.tenantId, tenant.id), inArray(customers.id, customerIds)))
    rows.forEach((r) => customerNames.set(r.id, r.name))
  }

  const filterParams = { status, boatId, dateFrom: dateFromRaw, dateTo: dateToRaw, q }

  return (
    <TenantWrapper tenant={tenantContext}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Reservas</h1>
            <p className="text-sm text-slate-500 mt-1">
              {total} {total === 1 ? 'reserva' : 'reservas'}
            </p>
          </div>
          <Link
            href={`${base}/new`}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Nova Reserva
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <form method="GET" action={base} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
              <select
                name="status"
                defaultValue={status ?? ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Barco</label>
              <select
                name="boatId"
                defaultValue={boatId ?? ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Todos</option>
                {boatsList.map((boat) => (
                  <option key={boat.id} value={boat.id}>
                    {boat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Início em</label>
              <input
                type="date"
                name="dateFrom"
                defaultValue={dateFromRaw ?? ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Início até</label>
              <input
                type="date"
                name="dateTo"
                defaultValue={dateToRaw ?? ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Busca (obs.)</label>
              <input
                type="text"
                name="q"
                defaultValue={q ?? ''}
                placeholder="Observações..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-5 flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
              >
                Filtrar
              </button>
              <Link href={base} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">
                Limpar
              </Link>
            </div>
          </form>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Início</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Fim</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Preço</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${STATUS_BADGES[booking.status]}`}>
                        {STATUS_LABELS[booking.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">{boatNames.get(booking.boatId) ?? booking.boatId}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {booking.customerId ? customerNames.get(booking.customerId) ?? booking.customerId : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(booking.startAt)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(booking.endAt)}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {booking.totalPrice !== null ? `R$ ${booking.totalPrice.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`${base}/${booking.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={buildQuery(base, { ...filterParams, page: page - 1 })}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={buildQuery(base, { ...filterParams, page: page + 1 })}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Próxima
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </TenantWrapper>
  )
}
