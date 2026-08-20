import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const bookings = sqliteTable('bookings', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  boatId: text('boat_id').notNull(),
  customerId: text('customer_id'),
  crewIds: text('crew_ids', { mode: 'json' }).default('[]').notNull(),
  status: text('status', { enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] }).notNull(),
  startAt: text('start_at').notNull(),
  endAt: text('end_at').notNull(),
  totalPrice: real('total_price'),
  notes: text('notes'),
  createdBy: text('created_by'),
  createdAt: text('created_at').default(new Date().toISOString()).notNull(),
  updatedAt: text('updated_at').default(new Date().toISOString()).notNull(),
})
