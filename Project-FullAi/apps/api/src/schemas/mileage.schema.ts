import { z } from 'zod'

const mileageValueSchema = z.preprocess(
  (value) => {
    if (typeof value === 'string' && value.trim() === '') {
      return Number.NaN
    }
    if (typeof value === 'boolean') {
      return Number.NaN
    }
    if (Array.isArray(value) || value === null) {
      return Number.NaN
    }
    return value
  },
  z.coerce
    .number({ message: 'Kilometer harus berupa angka yang valid' })
    .int('Kilometer harus berupa bilangan bulat')
    .min(0, 'Kilometer tidak boleh bernilai negatif'),
)

const recordedAtSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null || value === '') {
      return undefined
    }
    return value
  },
  z.coerce
    .date({ message: 'Format tanggal pencatatan tidak valid' })
    .optional(),
)

export const createMileageSchema = z.object({
  mileage: mileageValueSchema,
  recordedAt: recordedAtSchema,
})

export type CreateMileageInput = z.infer<typeof createMileageSchema>

