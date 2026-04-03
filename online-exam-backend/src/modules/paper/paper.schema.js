import { z } from '../../common/middleware/validate.js'

const idSchema = z.object({
  id: z.string().regex(/^\d+$/)
})

const subjectCodeSchema = z.string().trim().min(1).max(30).regex(/^[a-z][a-z0-9_-]*$/)
const questionTypeEnum = z.enum(['judge', 'select', 'text', 'fill', 'application'])
const richTextSchema = z.string().min(1).max(50000)
const optionalRichTextSchema = z.string().max(50000).optional().nullable()
const optionContentSchema = z.string().max(20000).optional().default('')
const optionSchema = z.object({
  A: optionContentSchema,
  B: optionContentSchema,
  C: optionContentSchema,
  D: optionContentSchema
})

const paperQuestionSchema = z.object({
  questionId: z.union([z.string(), z.number(), z.bigint()]).optional().nullable(),
  subject: subjectCodeSchema.optional(),
  type: questionTypeEnum,
  title: richTextSchema,
  score: z.coerce.number().int().min(1).max(100),
  options: z.union([optionSchema, z.null()]).optional(),
  answer: z.union([z.string().max(50000), z.array(z.string()), z.null()]).optional(),
  answers: z.array(z.string()).optional(),
  analysis: optionalRichTextSchema
})

const paperBodySchema = z.object({
  paperName: z.string().trim().min(1).max(200),
  subject: subjectCodeSchema,
  duration: z.coerce.number().int().min(10).max(600),
  totalScore: z.coerce.number().int().min(0).max(1000).optional().default(0),
  startTime: z.string().optional().nullable(),
  classIds: z.array(z.union([z.string(), z.number(), z.bigint()])).optional().default([]),
  status: z.coerce.number().int().min(0).max(1).optional().default(0),
  questionList: z.array(paperQuestionSchema).optional().default([])
})

export const paperListQuerySchema = z.object({
  pageNum: z.string().optional(),
  pageSize: z.string().optional(),
  paperName: z.string().optional(),
  subject: subjectCodeSchema.optional(),
  status: z.enum(['0', '1']).optional()
})

export const createPaperSchema = paperBodySchema
export const updatePaperSchema = paperBodySchema
export const updatePaperStatusSchema = z.object({
  status: z.coerce.number().int().min(0).max(1)
})
export const paperIdParamsSchema = idSchema
