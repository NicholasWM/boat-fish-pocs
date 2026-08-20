import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import path from 'path'
import * as schema from './schema'

const dbPath = path.join(process.cwd(), 'ornith.db')
const client = createClient({ url: `file:${dbPath}` })
export const db = drizzle(client, { schema, logger: process.env.NODE_ENV === 'development' })
export const rawClient = client
