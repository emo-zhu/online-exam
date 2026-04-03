import { success } from '../../common/response/index.js'
import { userService } from './user.service.js'

export const userController = {
  async list(ctx) {
    const data = await userService.listUsers(ctx.request.query)
    success(ctx, data)
  },

  async create(ctx) {
    const data = await userService.createUser(ctx.request.body)
    success(ctx, data)
  },

  async import(ctx) {
    const data = await userService.importUsers(ctx.request.files?.file)
    success(ctx, data)
  },

  async export(ctx) {
    const { filename, buffer } = await userService.exportUsers(ctx.request.query)
    ctx.status = 200
    ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    ctx.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`)
    ctx.body = buffer
  },

  async update(ctx) {
    const data = await userService.updateUser(ctx.params.id, ctx.request.body)
    success(ctx, data)
  },

  async updateStatus(ctx) {
    const data = await userService.updateStatus(ctx.params.id, ctx.request.body)
    success(ctx, data)
  },

  async resetPassword(ctx) {
    await userService.resetPassword(ctx.params.id, ctx.request.body)
    success(ctx, null)
  },

  async batchRemove(ctx) {
    const data = await userService.batchDeleteUsers(ctx.request.body)
    success(ctx, data)
  },

  async remove(ctx) {
    await userService.deleteUser(ctx.params.id)
    success(ctx, null)
  }
}
