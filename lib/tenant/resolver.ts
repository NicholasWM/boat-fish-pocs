import { eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { tenants } from '@/lib/db/schema'
import type { Tenant } from '@/types'

let cache: Map<string, Tenant | null> = new Map()
let cacheExpiry: number = 0
const CACHE_TTL = 60_000 // 1 minute

export async function resolveTenant(slug: string): Promise<Tenant | null> {
  const now = Date.now()
  if (now < cacheExpiry && cache.has(slug)) {
    return cache.get(slug) ?? null
  }

  const tenant = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1)

  const result = tenant[0] ?? null
  cache.set(slug, result)
  cacheExpiry = now + CACHE_TTL
  return result
}

export function clearTenantCache(): void {
  cache.clear()
  cacheExpiry = 0
}
