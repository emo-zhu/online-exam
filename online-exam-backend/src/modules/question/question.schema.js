import { z } from '../../common/middleware/validate.js'

const idSchema = z.object({
  id: z.string().regex(/^\d+$/)
})

const richTextSchema = z.string().min(1).max(50000)
const optionalRichTextSchema = z.string().max(50000).optional().nullable()
const subjectCodeSchema = z.string().trim().min(1).max(30).regex(/^[a-z][a-z0-9_-]*$/)
const typeEnum = z.enum(['judge', 'select', 'text', 'fill', 'application'])
const optionContentSchema = z.string().max(20000).optional().default('')

const optionSchema = z.object({
  A: optionContentSchema,
  B: optionContentSchema,
  C: optionContentSchema,
  D: optionContentSchema
})

const questionIdValueSchema = z.union([z.string(), z.number(), z.bigint()])

const createQuestionBodySchema = z.object({
  subject: subjectCodeSchema,
  categoryId: z.union([z.string(), z.number(), z.bigint()]).optional().nullable(),
  type: typeEnum,
  title: richTextSchema,
  score: z.coerce.number().int().min(1).max(100),
  options: z.union([optionSchema, z.null()]).optional(),
  answer: z.union([z.string().max(50000), z.array(z.string()), z.null()]).optional(),
  analysis: optionalRichTextSchema
})

export const questionListQuerySchema = z.object({
  pageNum: z.string().optional(),
  pageSize: z.string().optional(),
  title: z.string().optional(),
  subject: subjectCodeSchema.optional(),
  type: typeEnum.optional(),
  categoryId: z.string().regex(/^\d+$/).optional()
})

export const batchDeleteQuestionsSchema = z.object({
  ids: z.array(questionIdValueSchema).min(1)
})

export const createQuestionSchema = createQuestionBodySchema
export const updateQuestionSchema = createQuestionBodySchema
export const questionIdParamsSchema = idSchema
