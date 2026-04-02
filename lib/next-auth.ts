import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const res = await fetch(`${BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Client-Type": "web" },
          body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          credentials: "include",
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err?.message ?? "Email hoặc mật khẩu không đúng")
        }

        const json = await res.json()
        const { accessToken, user } = json.data

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          accessToken,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as { accessToken: string }).accessToken
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.user.id = token.id as string
      return session
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: { strategy: "jwt" },
}
