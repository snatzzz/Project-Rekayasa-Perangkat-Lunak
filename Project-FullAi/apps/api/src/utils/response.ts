import type { Response } from 'express'

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: unknown
}

export function sendSuccess<T>(res: Response, message: string, data: T, statusCode = 200): Response {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
  }
  return res.status(statusCode).json(payload)
}

export function sendError(res: Response, message: string, error?: unknown, statusCode = 400): Response {
  const payload: ApiResponse = {
    success: false,
    message,
    ...(error !== undefined ? { error } : {}),
  }
  return res.status(statusCode).json(payload)
}
