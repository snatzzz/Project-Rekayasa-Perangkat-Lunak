import { z } from 'zod'

export const recommendationSchema = z.object({
  complaint: z
    .string()
    .trim()
    .min(3, 'Keluhan harus diisi minimal 3 karakter non-spasi')
    .max(500, 'Keluhan tidak boleh melebihi 500 karakter'),
})

export type RecommendationInput = z.infer<typeof recommendationSchema>
