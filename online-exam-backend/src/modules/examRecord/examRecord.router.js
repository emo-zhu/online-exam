import Router from '@koa/router'
import { roleGuard } from '../../common/middleware/roleGuard.js'
import { validate } from '../../common/middleware/validate.js'
import { examRecordController } from './examRecord.controller.js'
import { paperIdParamsSchema, recordIdParamsSchema, studentAutosaveSchema, studentSubmitSchema, teacherMarkSchema, teacherRecordListQuerySchema } from './examRecord.schema.js'

export const examRecordRouter = new Router()

examRecordRouter.get('/student/exams', roleGuard(['student', 'admin']), examRecordController.listStudentExams)
examRecordRouter.get('/student/exams/:paperId', roleGuard(['student', 'admin']), validate(paperIdParamsSchema, 'params'), examRecordController.detailStudentExam)
examRecordRouter.post('/student/exams/:paperId/start', roleGuard(['student', 'admin']), validate(paperIdParamsSchema, 'params'), examRecordController.startStudentExam)
examRecordRouter.post('/student/exams/:paperId/submit', roleGuard(['student', 'admin']), validate(paperIdParamsSchema, 'params'), validate(studentSubmitSchema), examRecordController.submitStudentExam)
examRecordRouter.post('/student/exam-records/:id/autosave', roleGuard(['student', 'admin']), validate(recordIdParamsSchema, 'params'), validate(studentAutosaveSchema), examRecordController.autosaveStudentExam)
examRecordRouter.get('/student/scores', roleGuard(['student', 'admin']), examRecordController.listStudentScores)
examRecordRouter.get('/student/analysis/:id', roleGuard(['student', 'admin']), validate(recordIdParamsSchema, 'params'), examRecordController.studentAnalysis)
examRecordRouter.get('/wrong-books', roleGuard(['student', 'admin']), examRecordController.listWrongBooks)
examRecordRouter.delete('/wrong-books/:id', roleGuard(['student', 'admin']), validate(recordIdParamsSchema, 'params'), examRecordController.removeWrongBook)

examRecordRouter.get('/exam-records', roleGuard(['admin', 'teacher']), validate(teacherRecordListQuerySchema, 'query'), examRecordController.listTeacherRecords)
examRecordRouter.get('/exam-records/:id', roleGuard(['admin', 'teacher']), validate(recordIdParamsSchema, 'params'), examRecordController.teacherRecordDetail)
examRecordRouter.post('/exam-records/:id/mark', roleGuard(['admin', 'teacher']), validate(recordIdParamsSchema, 'params'), validate(teacherMarkSchema), examRecordController.submitTeacherMark)
