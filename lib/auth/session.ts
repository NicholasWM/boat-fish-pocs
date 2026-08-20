import { getServerSession } from 'next-auth'
import { authOptions } from './auth.config'

export async function getSession() {
  const session = await getServerSession(authOptions)
  return session
}

export async function getUser() {
  const session = await getSession()
  return session?.user ?? null
}
