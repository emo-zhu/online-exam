import { success } from '../../common/response/index.js'
import { authService } from './auth.service.js'

export const authController = {
  async captcha(ctx) {
    const data = await authService.getCaptcha()
    success(ctx, data)
  },

  async login(ctx) {
    const data = await authService.login(ctx.request.body, ctx)
    success(ctx, data)
  },

  async register(ctx) {
    const data = await authService.register(ctx.request.body)
    success(ctx, data)
  },

  async me(ctx) {
    const data = await authService.getCurrentUser(ctx.state.user.id)
    success(ctx, data)
  },

  async logout(ctx) {
    await authService.logout(ctx.request.body?.refreshToken, ctx.state.user.id)
    success(ctx, null)
  },

  async refreshToken(ctx) {
    const data = await authService.refreshAccessToken(ctx.request.body.refreshToken)
    success(ctx, data)
  },

  async changePassword(ctx) {
    await authService.changePassword(ctx.state.user.id, ctx.request.body)
    success(ctx, null, 'success')
  }
}
