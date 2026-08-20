import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core'

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  bookingId: text('booking_id'),
  amount: real('amount').notNull(),
  status: text('status', { enum: ['pending', 'paid', 'refunded', 'failed'] }).notNull(),
  method: text('method', { enum: ['credit_card', 'pix', 'boleto', 'cash'] }).notNull(),
  paidAt: text('paid_at'),
  dueAt: text('due_at').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').default(new Date().toISOString()).notNull(),
})
