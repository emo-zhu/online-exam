import { success } from '../../common/response/index.js'
import { questionCategoryService } from './questionCategory.service.js'

export const questionCategoryController = {
  async list(ctx) {
    const data = await questionCategoryService.listCategories(ctx.request.query)
    success(ctx, data)
  },

  async create(ctx) {
    const data = await questionCategoryService.createCategory(ctx.request.body)
    success(ctx, data)
  },

  async update(ctx) {
    const data = await questionCategoryService.updateCategory(ctx.params.id, ctx.request.body)
    success(ctx, data)
  },

  async remove(ctx) {
    await questionCategoryService.deleteCategory(ctx.params.id)
    success(ctx, null)
  }
}
