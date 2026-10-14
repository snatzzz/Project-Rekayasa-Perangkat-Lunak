import { z } from 'zod'

const currentYear = new Date().getFullYear()

const mileageSchema = z.preprocess(
  (value) =>
    typeof value === 'string' && value.trim() === ''
      ? Number.NaN
      : value,
  z.coerce
    .number()
    .int()
    .min(0, 'Kilometer saat ini tidak boleh bernilai negatif'),
)

export const createMotorcycleSchema = z.object({
  brand: z.string().trim().min(1, 'Merk motor wajib diisi'),
  model: z.string().trim().min(1, 'Model motor wajib diisi'),
  year: z.coerce
    .number()
    .int()
    .min(1950, 'Tahun motor tidak valid')
    .max(
      currentYear + 1,
      'Tahun motor tidak boleh melebihi tahun depan',
    ),
  currentMileage: mileageSchema,
})

export const updateMotorcycleSchema = z
  .object({
    brand: z.string().trim().min(1, 'Merk motor wajib diisi').optional(),
    model: z.string().trim().min(1, 'Model motor wajib diisi').optional(),
    year: z.coerce
      .number()
      .int()
      .min(1950, 'Tahun motor tidak valid')
      .max(
        currentYear + 1,
        'Tahun motor tidak boleh melebihi tahun depan',
      )
      .optional(),
    currentMileage: mileageSchema.optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    'Minimal satu field harus diisi untuk memperbarui data motor',
  )

export type CreateMotorcycleInput = z.infer<
  typeof createMotorcycleSchema
>

export type UpdateMotorcycleInput = z.infer<
  typeof updateMotorcycleSchema
>