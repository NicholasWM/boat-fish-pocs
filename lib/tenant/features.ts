import type { TenantFeatures } from '@/types'

export type FeatureKey = 'bookings' | 'fleet' | 'crew' | 'payments' | 'customers'

const DEFAULT_FEATURES: Record<FeatureKey, boolean> = {
  bookings: true,
  fleet: true,
  crew: true,
  payments: true,
  customers: true,
}

export function getFeatures(tenantFeatures?: TenantFeatures): Record<FeatureKey, boolean> {
  if (!tenantFeatures) return { ...DEFAULT_FEATURES }
  return { ...DEFAULT_FEATURES, ...tenantFeatures }
}

export function hasFeature(tenantFeatures: TenantFeatures | undefined, feature: FeatureKey): boolean {
  const features = getFeatures(tenantFeatures)
  return features[feature] ?? DEFAULT_FEATURES[feature]
}

export function getFeatureFlags(tenantFeatures?: TenantFeatures): Record<FeatureKey, boolean> {
  return getFeatures(tenantFeatures)
}
