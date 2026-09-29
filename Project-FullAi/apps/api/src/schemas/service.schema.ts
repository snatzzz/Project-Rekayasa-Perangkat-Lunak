import { z } from 'zod'

export const createServiceSchema = z.object({
  serviceType: z.string().trim().min(1, 'Jenis servis wajib diisi'),
  serviceDate: z.coerce.date({ message: 'Tanggal servis harus valid' }),
  mileage: z.coerce.number().int().min(0, 'Kilometer tidak boleh bernilai negatif'),
  cost: z.coerce.number().min(0, 'Biaya tidak boleh bernilai negatif'),
  notes: z.string().trim().optional().nullable(),
})

export const updateServiceSchema = z.object({
  serviceType: z.string().trim().min(1, 'Jenis servis wajib diisi').optional(),
  serviceDate: z.coerce.date().optional(),
  mileage: z.coerce.number().int().min(0, 'Kilometer tidak boleh bernilai negatif').optional(),
  cost: z.coerce.number().min(0, 'Biaya tidak boleh bernilai negatif').optional(),
  notes: z.string().trim().optional().nullable(),
})

export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
