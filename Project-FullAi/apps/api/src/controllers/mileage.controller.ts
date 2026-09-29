import type { Request, Response, NextFunction } from 'express'
import prisma from '../utils/prisma.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { createMileageSchema } from '../schemas/mileage.schema.js'

export async function getMileageRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
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

    const records = await prisma.mileageRecord.findMany({
      where: { motorcycleId },
      orderBy: { recordedAt: 'desc' },
    })

    sendSuccess(res, 'Riwayat kilometer berhasil diambil', {
      currentMileage: motorcycle.currentMileage,
      records,
    })
  } catch (err) {
    next(err)
  }
}

export async function addMileageRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const motorcycleId = parseInt(req.params.id as string, 10)
    if (isNaN(motorcycleId)) {
      sendError(res, 'ID motor tidak valid', null, 400)
      return
    }

    const validated = createMileageSchema.parse(req.body)

    const motorcycle = await prisma.motorcycle.findUnique({
      where: { id: motorcycleId },
    })

    if (!motorcycle) {
      sendError(res, 'Motor tidak ditemukan', null, 404)
      return
    }

    if (validated.mileage < motorcycle.currentMileage) {
      sendError(
        res,
        `Kilometer baru (${validated.mileage.toLocaleString()} KM) tidak boleh lebih rendah dari kilometer saat ini (${motorcycle.currentMileage.toLocaleString()} KM)`,
        null,
        400
      )
      return
    }

    // Transaction: create record and update motorcycle currentMileage
    const [record, updatedMotorcycle] = await prisma.$transaction([
      prisma.mileageRecord.create({
        data: {
          motorcycleId,
          mileage: validated.mileage,
          recordedAt: validated.recordedAt || new Date(),
        },
      }),
      prisma.motorcycle.update({
        where: { id: motorcycleId },
        data: { currentMileage: validated.mileage },
      }),
    ])

    sendSuccess(
      res,
      'Kilometer berhasil dicatat dan diperbarui',
      {
        record,
        currentMileage: updatedMotorcycle.currentMileage,
      },
      201
    )
  } catch (err) {
    next(err)
  }
}
