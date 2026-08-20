import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const boats = sqliteTable('boats', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  name: text('name').notNull(),
  type: text('type', { enum: ['pesca', 'passeio', 'luxury', 'fishing'] }).notNull(),
  capacity: integer('capacity').notNull(),
  description: text('description'),
  photoUrls: text('photo_urls', { mode: 'json' }).default('[]').notNull(),
  status: text('status', { enum: ['active', 'maintenance', 'inactive'] }).default('active').notNull(),
  pricing: text('pricing', { mode: 'json' }).default('{}').notNull(),
  features: text('features', { mode: 'json' }).default('[]').notNull(),
  createdAt: text('created_at').default(new Date().toISOString()).notNull(),
  updatedAt: text('updated_at').default(new Date().toISOString()).notNull(),
})
