'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import type { TenantContext } from '@/types'

interface BookingFormProps {
  tenant: TenantContext
}

export function BookingForm({ tenant }: BookingFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [boats, setBoats] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    boatId: '',
    customerId: '',
    startDate: '',
    endDate: '',
    crewIds: [],
    totalPrice: '',
    notes: '',
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/fleet').then(r => r.json()),
      fetch('/api/customers').then(r => r.json()),
    ]).then(([boatsData, customersData]) => {
      setBoats(boatsData)
      setCustomers(customersData)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create booking')
        return
      }

      router.push(`/tenant/${tenant.slug}/bookings`)
    } catch (err) {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
      )}

      <Select
        label="Barco"
        value={formData.boatId}
        onChange={(e) => setFormData({ ...formData, boatId: e.target.value })}
        options={[{ value: '', label: 'Selecione...' }, ...boats.map(b => ({ value: b.id, label: b.name }))]}
        required
      />

      <Select
        label="Cliente"
        value={formData.customerId}
        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
        options={[{ value: '', label: 'Selecione...' }, ...customers.map(c => ({ value: c.id, label: c.name }))]}
        required
      />

      <Input
        label="Data Início"
        type="datetime-local"
        value={formData.startDate}
        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
        required
      />

      <Input
        label="Data Fim"
        type="datetime-local"
        value={formData.endDate}
        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
        required
      />

      <Input
        label="Preço Total (R$)"
        type="number"
        value={formData.totalPrice}
        onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
      />

      <Textarea
        label="Observações"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        rows={4}
      />

      <Button type="submit" loading={loading}>
        Criar Reserva
      </Button>
    </form>
  )
}
