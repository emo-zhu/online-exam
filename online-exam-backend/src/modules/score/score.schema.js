import { z } from '../../common/middleware/validate.js'

const paperIdSchema = z.string().regex(/^\d+$/)

export const scoreListQuerySchema = z.object({
  pageNum: z.string().optional(),
  pageSize: z.string().optional(),
  paperId: paperIdSchema.optional(),
  keyword: z.string().optional()
})

export const scoreStatsQuerySchema = z.object({
  paperId: paperIdSchema,
  keyword: z.string().optional()
})

export const scoreExportQuerySchema = z.object({
  paperId: paperIdSchema,
  keyword: z.string().optional()
})
