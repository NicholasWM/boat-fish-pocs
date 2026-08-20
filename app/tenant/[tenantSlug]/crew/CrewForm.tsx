'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { TenantContext } from '@/types'

interface CrewFormProps {
  tenant: TenantContext
  initialData?: any
}

export function CrewForm({ tenant, initialData }: CrewFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: initialData?.name ?? '',
    email: initialData?.email ?? '',
    role: initialData?.role ?? 'captain',
    boatIds: initialData?.boat_ids ? initialData.boat_ids.split(',') : [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = initialData ? `/api/crew/${initialData.id}` : '/api/crew'
      const method = initialData ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save')
        return
      }

      router.push(`/tenant/${tenant.slug}/crew`)
    } catch (err) {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

      <Input label="Nome" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
      
      <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
      
      <Select
        label="Função"
        value={formData.role}
        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        options={[
          { value: 'captain', label: 'Captain' },
          { value: 'first_mate', label: 'First Mate' },
          { value: 'guide', label: 'Guide' },
        ]}
        required
      />

      <Button type="submit" loading={loading}>
        {initialData ? 'Salvar' : 'Criar Membro'}
      </Button>
    </form>
  )
}
