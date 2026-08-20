import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const crewMembers = sqliteTable('crew_members', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  userId: text('user_id'),
  boatIds: text('boat_ids', { mode: 'json' }).default('[]').notNull(),
  role: text('role', { enum: ['captain', 'first_mate', 'guide'] }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: text('created_at').default(new Date().toISOString()).notNull(),
})
