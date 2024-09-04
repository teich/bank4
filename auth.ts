import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import authConfig from "./auth.config"

const prisma = new PrismaClient()

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig

  // TODO: The uath required callback is blocking an important page. 
  // callbacks: {
  //   authorized: async ({ auth }) => {
  //     return !!auth
  //   }
  // }
})