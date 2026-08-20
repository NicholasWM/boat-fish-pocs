'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { TenantContext } from '@/types'

const TenantContextAPI = createContext<TenantContext | null>(null)

export function TenantProvider({
  tenant,
  children,
}: {
  tenant: TenantContext
  children: React.ReactNode
}) {
  const [resolved, setResolved] = useState<TenantContext | null>(null)

  useEffect(() => {
    setResolved(tenant)
  }, [tenant])

  return (
    <TenantContextAPI.Provider value={resolved}>
      {children}
    </TenantContextAPI.Provider>
  )
}

export function useTenant(): TenantContext | null {
  return useContext(TenantContextAPI)
}
