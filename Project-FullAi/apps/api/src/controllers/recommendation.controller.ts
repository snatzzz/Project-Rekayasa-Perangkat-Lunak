import type { Request, Response, NextFunction } from 'express'
import prisma from '../utils/prisma.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { recommendationSchema } from '../schemas/recommendation.schema.js'
import { getRecommendations } from '../services/recommendation.service.js'

export async function getMotorcycleRecommendation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const motorcycleId = parseInt(req.params.id as string, 10)
    if (isNaN(motorcycleId)) {
      sendError(res, 'ID motor tidak valid', null, 400)
      return
    }

    const motorcycle = await prisma.motorcycle.findUnique({
      where: { id: motorcycleId },
    })

    if (!motorcycle) {
      sendError(res, 'Motor tidak ditemukan', null, 404)
      return
    }

    const validated = recommendationSchema.parse(req.body)
    const result = getRecommendations(validated.complaint)

    sendSuccess(res, 'Rekomendasi awal berhasil diproses', {
      motorcycleId: motorcycle.id,
      motorcycleName: `${motorcycle.brand} ${motorcycle.model}`,
      complaint: validated.complaint,
      ...result,
    })
  } catch (err) {
    next(err)
  }
}
