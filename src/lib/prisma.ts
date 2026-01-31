// For React Native, we're going to create a simple instance of the client
// without the global attachment which is more suitable for server environments

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client'

let prismaInstance: PrismaClient | undefined

function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
    prismaInstance = new PrismaClient({ adapter })
  }
  return prismaInstance
}

export const prisma = getPrismaClient()

export default prisma
