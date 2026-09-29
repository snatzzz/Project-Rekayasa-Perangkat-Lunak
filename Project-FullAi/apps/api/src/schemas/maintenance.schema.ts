import { z } from 'zod'

export const createMaintenanceSchema = z.object({
  maintenanceType: z.string().trim().min(1, 'Jenis maintenance wajib diisi'),
  intervalKm: z.coerce.number().int().gt(0, 'Interval kilometer harus lebih dari 0'),
  intervalDays: z.coerce.number().int().gt(0, 'Interval hari harus lebih dari 0'),
  lastServiceMileage: z.coerce.number().int().min(0, 'Kilometer servis terakhir tidak boleh bernilai negatif'),
  lastServiceDate: z.coerce.date({ message: 'Tanggal servis terakhir harus valid' }),
})

export const updateMaintenanceSchema = z.object({
  maintenanceType: z.string().trim().min(1, 'Jenis maintenance wajib diisi').optional(),
  intervalKm: z.coerce.number().int().gt(0, 'Interval kilometer harus lebih dari 0').optional(),
  intervalDays: z.coerce.number().int().gt(0, 'Interval hari harus lebih dari 0').optional(),
  lastServiceMileage: z.coerce.number().int().min(0, 'Kilometer servis terakhir tidak boleh bernilai negatif').optional(),
  lastServiceDate: z.coerce.date().optional(),
})

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>
