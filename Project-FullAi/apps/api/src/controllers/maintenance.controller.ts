import type { Request, Response, NextFunction } from 'express'
import prisma from '../utils/prisma.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { createMaintenanceSchema, updateMaintenanceSchema } from '../schemas/maintenance.schema.js'
import { calculateMaintenanceStatus } from '../services/maintenanceCalculation.service.js'

export async function getMaintenanceSchedules(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      orderBy: { createdAt: 'asc' },
    })

    const calculatedSchedules = rawSchedules.map((schedule) =>
      calculateMaintenanceStatus(schedule, motorcycle.currentMileage)
    )

    sendSuccess(res, 'Jadwal maintenance berhasil diambil', {
      currentMileage: motorcycle.currentMileage,
      schedules: calculatedSchedules,
    })
  } catch (err) {
    next(err)
  }
}

export async function createMaintenanceSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const motorcycleId = parseInt(req.params.id as string, 10)
    if (isNaN(motorcycleId)) {
      sendError(res, 'ID motor tidak valid', null, 400)
      return
    }

    const validated = createMaintenanceSchema.parse(req.body)

    const motorcycle = await prisma.motorcycle.findUnique({
      where: { id: motorcycleId },
    })

    if (!motorcycle) {
      sendError(res, 'Motor tidak ditemukan', null, 404)
      return
    }

    const rawSchedule = await prisma.maintenanceSchedule.create({
      data: {
        motorcycleId,
        maintenanceType: validated.maintenanceType,
        intervalKm: validated.intervalKm,
        intervalDays: validated.intervalDays,
        lastServiceMileage: validated.lastServiceMileage,
        lastServiceDate: validated.lastServiceDate,
      },
    })

    const calculated = calculateMaintenanceStatus(rawSchedule, motorcycle.currentMileage)

    sendSuccess(res, 'Jadwal maintenance berhasil ditambahkan', calculated, 201)
  } catch (err) {
    next(err)
  }
}

export async function updateMaintenanceSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      sendError(res, 'ID maintenance tidak valid', null, 400)
      return
    }

    const validated = updateMaintenanceSchema.parse(req.body)

    const existing = await prisma.maintenanceSchedule.findUnique({
      where: { id },
      include: { motorcycle: true },
    })

    if (!existing) {
      sendError(res, 'Jadwal maintenance tidak ditemukan', null, 404)
      return
    }

    const updated = await prisma.maintenanceSchedule.update({
      where: { id },
      data: {
        ...(validated.maintenanceType !== undefined ? { maintenanceType: validated.maintenanceType } : {}),
        ...(validated.intervalKm !== undefined ? { intervalKm: validated.intervalKm } : {}),
        ...(validated.intervalDays !== undefined ? { intervalDays: validated.intervalDays } : {}),
        ...(validated.lastServiceMileage !== undefined ? { lastServiceMileage: validated.lastServiceMileage } : {}),
        ...(validated.lastServiceDate !== undefined ? { lastServiceDate: validated.lastServiceDate } : {}),
      },
    })

    const calculated = calculateMaintenanceStatus(updated, existing.motorcycle.currentMileage)

    sendSuccess(res, 'Jadwal maintenance berhasil diperbarui', calculated)
  } catch (err) {
    next(err)
  }
}

export async function deleteMaintenanceSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      sendError(res, 'ID maintenance tidak valid', null, 400)
      return
    }

    const existing = await prisma.maintenanceSchedule.findUnique({ where: { id } })
    if (!existing) {
      sendError(res, 'Jadwal maintenance tidak ditemukan', null, 404)
      return
    }

    await prisma.maintenanceSchedule.delete({ where: { id } })
    sendSuccess(res, 'Jadwal maintenance berhasil dihapus', { id })
  } catch (err) {
    next(err)
  }
}
