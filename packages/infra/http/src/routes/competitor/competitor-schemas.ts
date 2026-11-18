import { z } from 'zod'

const competitorSchema = z.object({
  name: z.string(),
  role: z.string(),
  marketFocus: z.string(),
  services: z.string(),
  features: z.string(),
  audience: z.string(),
  rationale: z.string(),
  url: z.string().nullish(),
})

export const competitorsBodySchema = z.object({ competitors: z.array(competitorSchema) })

export const markCompetitorBodySchema = z.object({ incorrect: z.boolean() })

export const competitorsApprovalBodySchema = z.object({ approved: z.boolean() })

export const competitorProjectParamsSchema = z.object({ id: z.string() })

export const competitorParamsSchema = competitorProjectParamsSchema.extend({
  competitorId: z.string(),
})
