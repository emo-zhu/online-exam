import { success } from '../../common/response/index.js'
import { examRecordService } from './examRecord.service.js'

export const examRecordController = {
  async listStudentExams(ctx) {
    const data = await examRecordService.listStudentExams(ctx.state.user)
    success(ctx, data)
  },

  async detailStudentExam(ctx) {
    const data = await examRecordService.getStudentExamDetail(ctx.params.paperId, ctx.state.user)
    success(ctx, data)
  },

  async startStudentExam(ctx) {
    const data = await examRecordService.startStudentExam(ctx.params.paperId, ctx.state.user)
    success(ctx, data)
  },

  async submitStudentExam(ctx) {
    const data = await examRecordService.submitStudentExam(ctx.params.paperId, ctx.request.body, ctx.state.user)
    success(ctx, data)
  },

  async autosaveStudentExam(ctx) {
    const data = await examRecordService.autosaveStudentExam(ctx.params.id, ctx.request.body, ctx.state.user)
    success(ctx, data)
  },

  async listStudentScores(ctx) {
    const data = await examRecordService.listStudentScores(ctx.state.user)
    success(ctx, data)
  },

  async studentAnalysis(ctx) {
    const data = await examRecordService.getStudentAnalysis(ctx.params.id, ctx.state.user)
    success(ctx, data)
  },

  async listTeacherRecords(ctx) {
    const data = await examRecordService.listTeacherRecords(ctx.request.query)
    success(ctx, data)
  },

  async teacherRecordDetail(ctx) {
    const data = await examRecordService.getTeacherMarkDetail(ctx.params.id)
    success(ctx, data)
  },

  async submitTeacherMark(ctx) {
    const data = await examRecordService.submitTeacherMark(ctx.params.id, ctx.request.body, ctx.state.user)
    success(ctx, data)
  },

  async listWrongBooks(ctx) {
    const data = await examRecordService.listWrongBooks(ctx.state.user)
    success(ctx, data)
  },

  async removeWrongBook(ctx) {
    await examRecordService.removeWrongBook(ctx.params.id, ctx.state.user)
    success(ctx, null)
  }
}
