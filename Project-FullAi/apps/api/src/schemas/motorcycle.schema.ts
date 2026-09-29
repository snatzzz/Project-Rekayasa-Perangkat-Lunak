import { z } from 'zod'

export const createMotorcycleSchema = z.object({
  brand: z.string().trim().min(1, 'Merk motor wajib diisi'),
  model: z.string().trim().min(1, 'Model motor wajib diisi'),
  year: z.coerce.number().int().min(1950, 'Tahun motor tidak valid').max(new Date().getFullYear() + 1, 'Tahun motor tidak boleh melebihi tahun depan'),
  currentMileage: z.coerce.number().int().min(0, 'Kilometer saat ini tidak boleh bernilai negatif'),
})

export const updateMotorcycleSchema = z.object({
  brand: z.string().trim().min(1, 'Merk motor wajib diisi').optional(),
  model: z.string().trim().min(1, 'Model motor wajib diisi').optional(),
  year: z.coerce.number().int().min(1950, 'Tahun motor tidak valid').max(new Date().getFullYear() + 1, 'Tahun motor tidak boleh melebihi tahun depan').optional(),
  currentMileage: z.coerce.number().int().min(0, 'Kilometer saat ini tidak boleh bernilai negatif').optional(),
})

export type CreateMotorcycleInput = z.infer<typeof createMotorcycleSchema>
export type UpdateMotorcycleInput = z.infer<typeof updateMotorcycleSchema>
