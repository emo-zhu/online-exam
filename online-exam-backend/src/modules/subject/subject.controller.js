import { success } from '../../common/response/index.js'
import { subjectService } from './subject.service.js'

export const subjectController = {
  async list(ctx) {
    const data = await subjectService.listSubjects(ctx.request.query)
    success(ctx, data)
  },

  async create(ctx) {
    const data = await subjectService.createSubject(ctx.request.body)
    success(ctx, data)
  },

  async update(ctx) {
    const data = await subjectService.updateSubject(ctx.params.id, ctx.request.body)
    success(ctx, data)
  },

  async remove(ctx) {
    await subjectService.deleteSubject(ctx.params.id)
    success(ctx, null)
  }
}
