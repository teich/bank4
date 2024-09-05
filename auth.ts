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
        session.user.id = token.id
        return session
      }, 
  //   async signIn({ user, account, profile, email, credentials }) {
  //     // Get the intended destination
  //     const { callbackUrl } = (account as any) || {};

  //     // If we're already trying to access /create-family, allow it
  //     if (callbackUrl && callbackUrl.includes('create-family')) {
  //       return true;
  //     }

  //     const userInFamily = await prisma.user.findUnique({
  //       where: { id: user.id },
  //       include: { family: true },
  //     });

  //     if (!userInFamily?.family) {
  //       return "/create-family"
  //     }

  //     return true
  //   },
  },

  // TODO: The auth required callback is blocking an important page. 
  // callbacks: {
  //   authorized: async ({ auth }) => {
  //     return !!auth
  //   }
  // }
})