import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { sendError } from '../utils/response.js'

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  console.error('Unhandled error:', err)

  if (err instanceof ZodError) {
    const errorMessages = err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    sendError(res, 'Validasi input gagal', errorMessages, 400)
    return
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      sendError(res, 'Data tidak ditemukan', null, 404)
      return
    }
    if (err.code === 'P2003') {
      sendError(res, 'Data relasi tidak valid', null, 400)
      return
    }
  }

  const message = err instanceof Error ? err.message : 'Terjadi kesalahan internal pada server'
  sendError(res, message, null, 500)
}
