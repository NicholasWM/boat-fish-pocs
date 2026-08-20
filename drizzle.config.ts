import { defineConfig } from 'drizzle-kit'
import path from 'path'

export default defineConfig({
  schema: './lib/db/schema/index.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: `file:${path.join(process.cwd(), 'ornith.db')}`,
  },
  verbose: true,
  strict: true,
})
