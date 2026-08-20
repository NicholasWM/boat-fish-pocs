import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { tenants, users, boats, bookings, crewMembers, customers, payments } from '@/lib/db/schema'

export type Tenant = InferSelectModel<typeof tenants>
export type TenantInsert = InferInsertModel<typeof tenants>

export type User = InferSelectModel<typeof users>
export type UserInsert = InferInsertModel<typeof users>

export type Boat = InferSelectModel<typeof boats>
export type BoatInsert = InferInsertModel<typeof boats>

export type Booking = InferSelectModel<typeof bookings>
export type BookingInsert = InferInsertModel<typeof bookings>

export type CrewMember = InferSelectModel<typeof crewMembers>
export type CrewMemberInsert = InferInsertModel<typeof crewMembers>

export type Customer = InferSelectModel<typeof customers>
export type CustomerInsert = InferInsertModel<typeof customers>

export type Payment = InferSelectModel<typeof payments>
export type PaymentInsert = InferInsertModel<typeof payments>

export type TenantFeatures = Record<string, boolean>

export type TenantBranding = {
  companyName?: string
  logoUrl?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  faviconUrl?: string
  bgColor?: string
  surfaceColor?: string
  textColor?: string
}

export type TenantContext = {
  id: string
  slug: string
  name: string
  features: TenantFeatures
  branding: TenantBranding
}
