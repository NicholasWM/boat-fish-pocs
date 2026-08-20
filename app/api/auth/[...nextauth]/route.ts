import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db, rawClient } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { compare } from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        const [user] = await db.select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1)

        if (!user) {
          throw new Error('Invalid credentials')
        }

        const isValid = await compare(credentials.password, user.passwordHash)
        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        if (!user.isActive) {
          throw new Error('Account deactivated')
        }

        const result = await rawClient.execute(
          'SELECT t.slug FROM tenants t JOIN users u ON u.tenant_id = t.id WHERE u.id = ?',
          [user.id]
        )
        const tenantSlug = ((result.rows[0] as any)?.slug) ?? null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          tenantSlug,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          tenantId: (user as any).tenantId,
          role: (user as any).role,
          tenantSlug: (user as any).tenantSlug,
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: (token as any).id,
          tenantId: (token as any).tenantId,
          role: (token as any).role,
          tenantSlug: (token as any).tenantSlug,
        },
      }
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
