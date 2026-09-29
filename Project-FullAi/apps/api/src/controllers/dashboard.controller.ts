import type { Request, Response, NextFunction } from 'express'
import prisma from '../utils/prisma.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { calculateMaintenanceStatus } from '../services/maintenanceCalculation.service.js'
import { calculateHealthScore } from '../services/healthScore.service.js'

export async function getDashboardData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const motorcycleId = parseInt(req.params.id as string, 10)
    if (isNaN(motorcycleId)) {
      sendError(res, 'ID motor tidak valid', null, 400)
      return
    }

    const motorcycle = await prisma.motorcycle.findUnique({
      where: { id: motorcycleId },
      include: {
        mileageRecords: {
          orderBy: { recordedAt: 'desc' },
          take: 5,
        },
        serviceHistories: {
          orderBy: { serviceDate: 'desc' },
          take: 5,
        },
        maintenanceSchedules: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!motorcycle) {
      sendError(res, 'Motor tidak ditemukan', null, 404)
      return
    }

    // Calculate dynamic maintenance statuses
    const calculatedSchedules = motorcycle.maintenanceSchedules.map((schedule) =>
      calculateMaintenanceStatus(schedule, motorcycle.currentMileage)
    )

    // Calculate health score
    const healthScore = calculateHealthScore(calculatedSchedules)

    // Filter closest maintenance (due soon or upcoming, sorted by remainingKm)
    const upcomingOrDue = calculatedSchedules
      .filter((s) => s.status !== 'OVERDUE')
      .sort((a, b) => a.remainingKm - b.remainingKm)

    const overdueItems = calculatedSchedules.filter((s) => s.status === 'OVERDUE')

    sendSuccess(res, 'Data dashboard berhasil diambil', {
      motorcycle: {
        id: motorcycle.id,
        brand: motorcycle.brand,
        model: motorcycle.model,
        year: motorcycle.year,
        currentMileage: motorcycle.currentMileage,
        createdAt: motorcycle.createdAt,
      },
      healthScore,
      summary: {
        currentMileage: motorcycle.currentMileage,
        totalSchedules: calculatedSchedules.length,
        dueSoonCount: healthScore.details.dueSoonCount,
        overdueCount: healthScore.details.overdueCount,
        dueCount: healthScore.details.dueCount,
        totalServices: motorcycle.serviceHistories.length,
      },
      closestMaintenance: upcomingOrDue.slice(0, 3),
      overdueMaintenance: overdueItems,
      allSchedules: calculatedSchedules,
      recentServices: motorcycle.serviceHistories.slice(0, 3),
      recentMileage: motorcycle.mileageRecords,
    })
  } catch (err) {
    next(err)
  }
}
