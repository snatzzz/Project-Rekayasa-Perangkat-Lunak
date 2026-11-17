import type { Request, Response, NextFunction } from 'express'
import prisma from '../utils/prisma.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { createServiceSchema, updateServiceSchema } from '../schemas/service.schema.js'

export async function getServices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const motorcycleId = parseInt(req.params.id as string, 10)
    if (isNaN(motorcycleId) || motorcycleId <= 0) {
      sendError(res, 'ID motor tidak valid', null, 400)
      return
    }

    const services = await prisma.serviceHistory.findMany({
      where: { motorcycleId },
      orderBy: [{ serviceDate: 'desc' }, { id: 'desc' }],
    })

    sendSuccess(res, 'Riwayat servis berhasil diambil', services)
  } catch (err) {
    next(err)
  }
}

export async function createService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const motorcycleId = parseInt(req.params.id as string, 10)
    if (isNaN(motorcycleId) || motorcycleId <= 0) {
      sendError(res, 'ID motor tidak valid', null, 400)
      return
    }

    const validated = createServiceSchema.parse(req.body)

    const motorcycle = await prisma.motorcycle.findUnique({
      where: { id: motorcycleId },
    })

    if (!motorcycle) {
      sendError(res, 'Motor tidak ditemukan', null, 404)
      return
    }

    // Validate that service date is not in the future
    if (new Date(validated.serviceDate).getTime() > Date.now() + 60000) {
      sendError(res, 'Tanggal servis tidak boleh di masa depan', null, 400)
      return
    }

    // 1. Validate that service mileage is not lower than motorcycle currentMileage
    if (validated.mileage < motorcycle.currentMileage) {
      sendError(
        res,
        `Kilometer servis (${validated.mileage.toLocaleString()} KM) tidak boleh lebih rendah dari kilometer saat ini (${motorcycle.currentMileage.toLocaleString()} KM)`,
        null,
        400
      )
      return
    }

    // 2. Create the service history
    const service = await prisma.serviceHistory.create({
      data: {
        motorcycleId,
        serviceType: validated.serviceType,
        serviceDate: validated.serviceDate,
        mileage: validated.mileage,
        cost: validated.cost,
        notes: validated.notes ?? null,
      },
    })

    // 2. If service mileage is greater than current motorcycle mileage, update motorcycle currentMileage
    if (validated.mileage > motorcycle.currentMileage) {
      await prisma.motorcycle.update({
        where: { id: motorcycleId },
        data: { currentMileage: validated.mileage },
      })
      // Also record mileage
      await prisma.mileageRecord.create({
        data: {
          motorcycleId,
          mileage: validated.mileage,
          recordedAt: validated.serviceDate,
        },
      })
    }

    // 3. Check for matching MaintenanceSchedule
    const schedules = await prisma.maintenanceSchedule.findMany({
      where: { motorcycleId },
    })

    const normalizedServiceType = validated.serviceType.toLowerCase().trim()
    let syncedSchedule = null

    for (const schedule of schedules) {
      const normalizedScheduleType = schedule.maintenanceType.toLowerCase().trim()
      if (
        normalizedServiceType.includes(normalizedScheduleType) ||
        normalizedScheduleType.includes(normalizedServiceType)
      ) {
        syncedSchedule = await prisma.maintenanceSchedule.update({
          where: { id: schedule.id },
          data: {
            lastServiceMileage: validated.mileage,
            lastServiceDate: validated.serviceDate,
          },
        })
        break // Match first corresponding schedule
      }
    }

    sendSuccess(
      res,
      syncedSchedule
        ? `Riwayat servis berhasil dicatat dan jadwal "${syncedSchedule.maintenanceType}" telah diperbarui`
        : 'Riwayat servis berhasil dicatat',
      {
        service,
        syncedSchedule,
      },
      201
    )
  } catch (err) {
    next(err)
  }
}

export async function updateService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id) || id <= 0) {
      sendError(res, 'ID riwayat servis tidak valid', null, 400)
      return
    }

    const validated = updateServiceSchema.parse(req.body)

    const existing = await prisma.serviceHistory.findUnique({
      where: { id },
      include: { motorcycle: true },
    })
    if (!existing) {
      sendError(res, 'Riwayat servis tidak ditemukan', null, 404)
      return
    }

    if (
      validated.serviceDate !== undefined &&
      new Date(validated.serviceDate).getTime() > Date.now() + 60000
    ) {
      sendError(res, 'Tanggal servis tidak boleh di masa depan', null, 400)
      return
    }

    const updated = await prisma.serviceHistory.update({
      where: { id },
      data: {
        ...(validated.serviceType !== undefined ? { serviceType: validated.serviceType } : {}),
        ...(validated.serviceDate !== undefined ? { serviceDate: validated.serviceDate } : {}),
        ...(validated.mileage !== undefined ? { mileage: validated.mileage } : {}),
        ...(validated.cost !== undefined ? { cost: validated.cost } : {}),
        ...(validated.notes !== undefined ? { notes: validated.notes } : {}),
      },
    })

    // If service mileage was updated and exceeds motorcycle currentMileage, sync motorcycle currentMileage
    if (validated.mileage !== undefined && validated.mileage > existing.motorcycle.currentMileage) {
      await prisma.motorcycle.update({
        where: { id: existing.motorcycleId },
        data: { currentMileage: validated.mileage },
      })
    }

    sendSuccess(res, 'Riwayat servis berhasil diperbarui', updated)
  } catch (err) {
    next(err)
  }
}

export async function deleteService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id) || id <= 0) {
      sendError(res, 'ID riwayat servis tidak valid', null, 400)
      return
    }

    const existing = await prisma.serviceHistory.findUnique({
      where: { id },
      include: { motorcycle: true },
    })
    if (!existing) {
      sendError(res, 'Riwayat servis tidak ditemukan', null, 404)
      return
    }

    await prisma.serviceHistory.delete({ where: { id } })
    sendSuccess(res, 'Riwayat servis berhasil dihapus', { id })
  } catch (err) {
    next(err)
  }
}
