import { z } from 'zod'

export const createMileageSchema = z.object({
  mileage: z.coerce.number().int().min(0, 'Kilometer tidak boleh bernilai negatif'),
  recordedAt: z.coerce.date().optional(),
})

export type CreateMileageInput = z.infer<typeof createMileageSchema>
