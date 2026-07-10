import { z } from 'zod'

export const listAuditSchema = z.object({
  take: z.string().optional(),
})
