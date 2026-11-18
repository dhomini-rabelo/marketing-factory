import { z } from 'zod'

export const documentBodySchema = z.object({
  title: z.string(),
  description: z.string(),
  body: z.string(),
})

export const documentProjectParamsSchema = z.object({ id: z.string() })

export const documentParamsSchema = documentProjectParamsSchema.extend({ slug: z.string() })
