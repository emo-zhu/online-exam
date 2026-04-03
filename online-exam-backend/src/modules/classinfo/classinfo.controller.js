import { success } from '../../common/response/index.js'
import { classService } from './classinfo.service.js'

export const classController = {
  async list(ctx) {
    const data = await classService.listClasses(ctx.request.query)
    success(ctx, data)
  },

  async create(ctx) {
    const data = await classService.createClass(ctx.request.body, ctx.state.user)
    success(ctx, data)
  },

  async update(ctx) {
    const data = await classService.updateClass(ctx.params.id, ctx.request.body)
    success(ctx, data)
  },

  async remove(ctx) {
    await classService.deleteClass(ctx.params.id)
    success(ctx, null)
  },

  async resetCode(ctx) {
    const data = await classService.resetCode(ctx.params.id)
    success(ctx, data)
  }
}
