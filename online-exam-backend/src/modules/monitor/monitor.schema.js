import { z } from '../../common/middleware/validate.js'

export const paperIdParamsSchema = z.object({
  paperId: z.string().regex(/^\d+$/)
})

export const monitorWarnSchema = z.object({
  studentId: z.union([z.string(), z.number(), z.bigint()]),
  content: z.string().trim().min(1).max(255)
})

export const monitorForceSubmitSchema = z.object({
  studentId: z.union([z.string(), z.number(), z.bigint()])
})

export const monitorLogQuerySchema = z.object({
  paperId: z.string().regex(/^\d+$/).optional(),
  pageSize: z.string().optional()
})
