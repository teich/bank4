import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import authConfig from "./auth.config"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,

  callbacks: {
      jwt({ token, user }) {
        if (user) { // User is available during sign-in
          token.id = user.id
        }
        return token
      },
      session({ session, token }) {
        if (token.id && typeof token.id === 'string') {
          session.user.id = token.id;
        }
        return session;
      },
  },

})