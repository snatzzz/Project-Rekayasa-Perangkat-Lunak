import type { Request, Response, NextFunction } from 'express'
import prisma from '../utils/prisma.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { createMotorcycleSchema, updateMotorcycleSchema } from '../schemas/motorcycle.schema.js'

export async function getAllMotorcycles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const motorcycles = await prisma.motorcycle.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        _count: {
          select: {
            mileageRecords: true,
            serviceHistories: true,
            maintenanceSchedules: true,
          },
        },
      },
    })
    sendSuccess(res, 'Daftar motor berhasil diambil', motorcycles)
  } catch (err) {
    next(err)
  }
}

export async function getMotorcycleById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id) || id <= 0) {
      sendError(res, 'ID motor tidak valid', null, 400)
      return
    }

    const motorcycle = await prisma.motorcycle.findUnique({
      where: { id },
    })

    if (!motorcycle) {
      sendError(res, 'Motor tidak ditemukan', null, 404)
      return
    }

    sendSuccess(res, 'Data motor berhasil diambil', motorcycle)
  } catch (err) {
    next(err)
  }
}

export async function createMotorcycle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = createMotorcycleSchema.parse(req.body)
    
    // Create motorcycle and initial mileage record
    const motorcycle = await prisma.motorcycle.create({
      data: {
        brand: validated.brand,
        model: validated.model,
        year: validated.year,
        currentMileage: validated.currentMileage,
        mileageRecords: {
          create: {
            mileage: validated.currentMileage,
            recordedAt: new Date(),
          },
        },
      },
    })

    sendSuccess(res, 'Motor berhasil ditambahkan', motorcycle, 201)
  } catch (err) {
    next(err)
  }
}

export async function updateMotorcycle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id) || id <= 0) {
      sendError(res, 'ID motor tidak valid', null, 400)
      return
    }

    const validated = updateMotorcycleSchema.parse(req.body)

    const existing = await prisma.motorcycle.findUnique({ where: { id } })
    if (!existing) {
      sendError(res, 'Motor tidak ditemukan', null, 404)
      return
    }

    if (validated.currentMileage !== undefined && validated.currentMileage < existing.currentMileage) {
      sendError(
        res,
        `Kilometer baru (${validated.currentMileage.toLocaleString()} KM) tidak boleh lebih rendah dari kilometer saat ini (${existing.currentMileage.toLocaleString()} KM)`,
        null,
        400
      )
      return
    }

    const updated = await prisma.motorcycle.update({
      where: { id },
      data: validated,
    })

    // If currentMileage was updated, record this in mileageRecords for consistency
    if (validated.currentMileage !== undefined && validated.currentMileage !== existing.currentMileage) {
      await prisma.mileageRecord.create({
        data: {
          motorcycleId: id,
          mileage: validated.currentMileage,
          recordedAt: new Date(),
        },
      })
    }

    sendSuccess(res, 'Data motor berhasil diperbarui', updated)
  } catch (err) {
    next(err)
  }
}

export async function deleteMotorcycle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id) || id <= 0) {
      sendError(res, 'ID motor tidak valid', null, 400)
      return
    }

    const existing = await prisma.motorcycle.findUnique({ where: { id } })
    if (!existing) {
      sendError(res, 'Motor tidak ditemukan', null, 404)
      return
    }

    // Explicitly delete cascade child records in transaction to guarantee referential cleanup
    await prisma.$transaction([
      prisma.mileageRecord.deleteMany({ where: { motorcycleId: id } }),
      prisma.serviceHistory.deleteMany({ where: { motorcycleId: id } }),
      prisma.maintenanceSchedule.deleteMany({ where: { motorcycleId: id } }),
      prisma.motorcycle.delete({ where: { id } }),
    ])
    sendSuccess(res, 'Motor berhasil dihapus', { id })
  } catch (err) {
    next(err)
  }
}
