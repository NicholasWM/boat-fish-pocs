import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  document: text('document'),
  notes: text('notes'),
  createdAt: text('created_at').default(new Date().toISOString()).notNull(),
})
