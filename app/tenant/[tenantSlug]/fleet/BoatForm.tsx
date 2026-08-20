'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import type { TenantContext } from '@/types'

interface BoatFormProps {
  tenant: TenantContext
  initialData?: any
  isEdit?: boolean
}

export function BoatForm({ tenant, initialData, isEdit }: BoatFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: initialData?.name ?? '',
    type: initialData?.type ?? 'pesca',
    capacity: initialData?.capacity ?? 1,
    description: initialData?.description ?? '',
    status: initialData?.status ?? 'active',
    basePrice: initialData?.pricing?.basePrice ?? '',
    perHour: initialData?.pricing?.perHour ?? '',
    minHours: initialData?.pricing?.minHours ?? '',
    features: initialData?.features ? initialData.features.split(',') : [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const pricing = {
        basePrice: Number(formData.basePrice) || 0,
        perHour: Number(formData.perHour) || 0,
        minHours: Number(formData.minHours) || 1,
      }

      const url = isEdit ? `/api/fleet/${initialData.id}` : '/api/fleet'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, pricing }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save')
        return
      }

      router.push(`/tenant/${tenant.slug}/fleet`)
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

      <Input
        label="Nome do Barco"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <Select
        label="Tipo"
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        options={[
          { value: 'pesca', label: 'Pesca' },
          { value: 'passeio', label: 'Passeio' },
          { value: 'luxury', label: 'Luxury' },
          { value: 'fishing', label: 'Fishing' },
        ]}
        required
      />

      <Input
        label="Capacidade (pessoas)"
        type="number"
        value={formData.capacity}
        onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
        required
      />

      <Textarea
        label="Descrição"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={4}
      />

      <Select
        label="Status"
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        options={[
          { value: 'active', label: 'Active' },
          { value: 'maintenance', label: 'Maintenance' },
          { value: 'inactive', label: 'Inactive' },
        ]}
      />

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Preço Base (R$)"
          type="number"
          value={formData.basePrice}
          onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
        />
        <Input
          label="Preço por Hora (R$)"
          type="number"
          value={formData.perHour}
          onChange={(e) => setFormData({ ...formData, perHour: e.target.value })}
        />
        <Input
          label="Horas Mínimas"
          type="number"
          value={formData.minHours}
          onChange={(e) => setFormData({ ...formData, minHours: e.target.value })}
        />
      </div>

      <Button type="submit" loading={loading}>
        {isEdit ? 'Salvar' : 'Criar Barco'}
      </Button>
    </form>
  )
}
