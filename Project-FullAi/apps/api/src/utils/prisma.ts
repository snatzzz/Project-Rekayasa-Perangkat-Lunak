import { PrismaClient } from '@prisma/client'
import { PrismaTiDBCloud } from '@tidbcloud/prisma-adapter'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL || ''

  // If connected to TiDB Cloud (gateway / prod.aws.tidbcloud.com or port 4000)
  if (dbUrl.includes('tidbcloud.com') || dbUrl.includes(':4000')) {
    try {
      const adapter = new PrismaTiDBCloud({ url: dbUrl })
      return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      })
    } catch (adapterErr) {
      console.warn('TiDB adapter initialization failed, falling back to standard client:', adapterErr)
    }
  }

  // Standard TCP client for local MySQL (Docker) and non-TiDB setups
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
