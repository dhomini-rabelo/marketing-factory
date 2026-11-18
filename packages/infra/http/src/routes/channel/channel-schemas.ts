import { z } from 'zod'

const findingSchema = z.object({
  competitor: z.string(),
  aspect: z.string(),
  kind: z.string(),
  statement: z.string(),
  url: z.string().nullish(),
  excerpt: z.string().nullish(),
  tool: z.string().nullish(),
})

export const channelAnalysisBodySchema = z.object({
  score: z.number(),
  rationale: z.string(),
  bestContent: z.object({
    type: z.string(),
    evidence: z.string(),
    basis: z.string(),
  }),
  findings: z.array(findingSchema),
})

export const channelProjectParamsSchema = z.object({ id: z.string() })

export const channelParamsSchema = channelProjectParamsSchema.extend({ channel: z.string() })
