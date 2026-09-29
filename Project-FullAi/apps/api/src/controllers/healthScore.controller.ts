import type { Request, Response, NextFunction } from 'express'
import prisma from '../utils/prisma.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { calculateMaintenanceStatus } from '../services/maintenanceCalculation.service.js'
import { calculateHealthScore } from '../services/healthScore.service.js'

export async function getMotorcycleHealthScore(req: Request, res: Response, next: NextFunction): Promise<void> {
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

    const rawSchedules = await prisma.maintenanceSchedule.findMany({
      where: { motorcycleId },
    })

    const calculatedSchedules = rawSchedules.map((schedule) =>
      calculateMaintenanceStatus(schedule, motorcycle.currentMileage)
    )

    const healthScore = calculateHealthScore(calculatedSchedules)

    sendSuccess(res, 'Health score berhasil dihitung', {
      motorcycleId: motorcycle.id,
      brand: motorcycle.brand,
      model: motorcycle.model,
      currentMileage: motorcycle.currentMileage,
      healthScore,
    })
  } catch (err) {
    next(err)
  }
}
