import { success } from '../../common/response/index.js'
import { questionService } from './question.service.js'

export const questionController = {
  async list(ctx) {
    const data = await questionService.listQuestions(ctx.request.query)
    success(ctx, data)
  },

  async create(ctx) {
    const data = await questionService.createQuestion(ctx.request.body)
    success(ctx, data)
  },

  async update(ctx) {
    const data = await questionService.updateQuestion(ctx.params.id, ctx.request.body)
    success(ctx, data)
  },

  async batchRemove(ctx) {
    const data = await questionService.batchDeleteQuestions(ctx.request.body)
    success(ctx, data)
  },

  async remove(ctx) {
    await questionService.deleteQuestion(ctx.params.id)
    success(ctx, null)
  },

  async uploadContentImage(ctx) {
    const data = await questionService.uploadContentImage(ctx.request.files?.file)
    success(ctx, data)
  },

  async getContentImage(ctx) {
    const { buffer, contentType } = await questionService.getContentImage(ctx.params.filename)
    ctx.status = 200
    ctx.set('Content-Type', contentType)
    ctx.set('Cache-Control', 'public, max-age=31536000, immutable')
    ctx.body = buffer
  }
}
