import { z } from '../../common/middleware/validate.js'

const idSchema = z.object({
  id: z.string().regex(/^\d+$/)
})

const subjectCodeSchema = z.string().trim().min(1).max(30).regex(/^[a-z][a-z0-9_-]*$/)
const subjectNameSchema = z.string().trim().min(1).max(50)

export const subjectListQuerySchema = z.object({
  keyword: z.string().optional()
})

export const createSubjectSchema = z.object({
  subjectCode: subjectCodeSchema,
  subjectName: subjectNameSchema,
  sortOrder: z.coerce.number().int().min(0).max(9999).optional().default(0)
})

export const updateSubjectSchema = createSubjectSchema
export const subjectIdParamsSchema = idSchema
