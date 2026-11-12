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

  // Safely report error details to diagnose serverless deployment issues without leaking credentials
  const isDev = process.env.NODE_ENV !== 'production'
  let message = process.env.NODE_ENV !== 'production' ? err.message : 'Terjadi kesalahan pada layanan'
  let errorDetails: string[] | null = null

  if (err instanceof Prisma.PrismaClientInitializationError) {
    message = 'Gagal inisialisasi koneksi database: ' + (err.errorCode || 'NO_CODE')
    errorDetails = [err.message ? err.message.replace(/(\/\/[^:]+:)[^@]+(@)/, '$1***$2') : 'Initialization error']
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    message = 'Database engine panic'
    errorDetails = [err.message ? err.message.split('\n')[0] : 'Rust panic']
  } else if (err instanceof Error) {
    message = isDev ? err.message : 'Terjadi kesalahan pada layanan: ' + err.name
    errorDetails = [err.message ? err.message.split('\n')[0] : 'Error']
  }

  sendError(res, message, errorDetails, 500)
}
