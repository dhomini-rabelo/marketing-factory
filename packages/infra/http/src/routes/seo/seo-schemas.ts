import { z } from 'zod'

const objectSchema = z.record(z.string(), z.unknown())

function isRealDate(value: string) {
  return !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
}

export const seoRoundBodySchema = z.object({
  tool: z.enum(['claude-code', 'grok-bot']),
  collectedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(isRealDate),
  note: z.string(),
  market: z.string(),
  searches: z.array(objectSchema).optional(),
})

export const seoCompetitorBodySchema = z.object({
  profile: objectSchema,
  categories: z.array(objectSchema),
  clusters: z.array(objectSchema),
  comparisons: z.array(objectSchema),
  examples: z.array(objectSchema),
  folders: z.array(objectSchema),
  items: z.array(objectSchema),
  audiences: z.array(objectSchema),
})

export const seoDocumentBodySchema = z.object({
  title: z.string(),
  fileName: z.string(),
  about: z.string(),
  body: z.string(),
})

export const seoProjectParamsSchema = z.object({ id: z.string() })

export const seoRoundParamsSchema = seoProjectParamsSchema.extend({ roundId: z.string() })

export const seoCompetitorParamsSchema = seoRoundParamsSchema.extend({ name: z.string() })
