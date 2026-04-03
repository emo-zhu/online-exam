import { z } from '../../common/middleware/validate.js'

const idSchema = z.object({
  id: z.string().regex(/^\d+$/)
})

const subjectCodeSchema = z.string().trim().min(1).max(30).regex(/^[a-z][a-z0-9_-]*$/)

export const questionCategoryListQuerySchema = z.object({
  pageNum: z.string().optional(),
  pageSize: z.string().optional(),
  name: z.string().optional(),
  subject: subjectCodeSchema.optional()
})

export const createQuestionCategorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  subject: subjectCodeSchema,
  desc: z.string().trim().max(255).optional().default('')
})

export const updateQuestionCategorySchema = createQuestionCategorySchema
export const questionCategoryIdParamsSchema = idSchema
