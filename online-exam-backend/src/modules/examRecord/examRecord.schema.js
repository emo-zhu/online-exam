import { z } from '../../common/middleware/validate.js'

const idSchema = z.object({
  id: z.string().regex(/^\d+$/)
})

const paperIdSchema = z.object({
  paperId: z.string().regex(/^\d+$/)
})

const answerItemSchema = z.object({
  paperQuestionId: z.union([z.string(), z.number(), z.bigint()]),
  answer: z.union([z.string(), z.array(z.string()), z.null()]).optional().nullable()
})

const markItemSchema = z.object({
  answerId: z.union([z.string(), z.number(), z.bigint()]),
  score: z.coerce.number().int().min(0).max(100),
  comment: z.string().trim().max(255).optional().nullable()
})

export const studentSubmitSchema = z.object({
  answers: z.array(answerItemSchema).optional().default([]),
  cheatCount: z.coerce.number().int().min(0).max(999).optional().default(0),
  forcedSubmit: z.coerce.number().int().min(0).max(1).optional().default(0)
})

export const studentAutosaveSchema = z.object({
  answers: z.array(answerItemSchema).optional().default([]),
  cheatCount: z.coerce.number().int().min(0).max(999).optional().default(0)
})

export const teacherRecordListQuerySchema = z.object({
  pageNum: z.string().optional(),
  pageSize: z.string().optional(),
  paperId: z.string().regex(/^\d+$/).optional(),
  examName: z.string().optional(),
  subject: z.string().optional(),
  status: z.enum(['1', '2']).optional(),
  studentName: z.string().optional(),
  className: z.string().optional()
})

export const teacherMarkSchema = z.object({
  answers: z.array(markItemSchema).min(1)
})

export const recordIdParamsSchema = idSchema
export const paperIdParamsSchema = paperIdSchema
