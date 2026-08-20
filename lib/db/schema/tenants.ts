import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey(),
  slug: text('slug').unique().notNull(),
  name: text('name').notNull(),
  domain: text('domain'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  features: text('features', { mode: 'json' }).default('{}').notNull(),
  branding: text('branding', { mode: 'json' }).default('{}').notNull(),
  createdAt: text('created_at').default(new Date().toISOString()).notNull(),
  updatedAt: text('updated_at').default(new Date().toISOString()).notNull(),
})
