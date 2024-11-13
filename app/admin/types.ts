import { User } from "@prisma/client"

export interface UserWithFamilies extends User {
  families: {
    id: string
    name: string
  }[]
} 