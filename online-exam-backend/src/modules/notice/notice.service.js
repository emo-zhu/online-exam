import { noticeRepository } from './notice.repository.js'
import { AppError } from '../../common/errors/appError.js'
import { ERROR_CODES } from '../../common/constants/errorCodes.js'
import { parsePagination, buildPageResult } from '../../common/utils/pagination.js'
import { toBigIntId } from '../../common/utils/ids.js'
import { formatDateTime } from '../../common/utils/datetime.js'

const mapNotice = (notice) => ({
  id: notice.id,
  title: notice.title,
  content: notice.content,
  type: notice.type,
  status: notice.status,
  publisher: notice.publisher?.realName || notice.publisher?.username || '',
  publisherId: notice.publisherId,
  publishTime: formatDateTime(notice.publishTime),
  createTime: formatDateTime(notice.createdAt)
})

export const noticeService = {
  async listNotices(query) {
    const { pageNum, pageSize, skip, take } = parsePagination(query)
    const where = {}

    if (query.title) {
      where.title = { contains: query.title }
    }

    const [total, list] = await Promise.all([
      noticeRepository.countNotices(where),
      noticeRepository.findNotices({ where, skip, take })
    ])

    return buildPageResult({
      list: list.map(mapNotice),
      total,
      pageNum,
      pageSize
    })
  },

  async createNotice(payload, currentUser) {
    const notice = await noticeRepository.createNotice({
      title: payload.title,
      content: payload.content,
      type: payload.type,
      status: 1,
      publisherId: currentUser.id,
      publishTime: new Date()
    })

    return mapNotice(notice)
  },

  async updateNotice(idValue, payload) {
    const id = toBigIntId(idValue)
    const existing = await noticeRepository.findNoticeById(id)
    if (!existing) {
      throw new AppError('公告不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }

    const notice = await noticeRepository.updateNotice(id, {
      title: payload.title,
      content: payload.content,
      type: payload.type,
      status: 1,
      publishTime: existing.publishTime || new Date()
    })

    return mapNotice(notice)
  },

  async deleteNotice(idValue) {
    const id = toBigIntId(idValue)
    const existing = await noticeRepository.findNoticeById(id)
    if (!existing) {
      throw new AppError('公告不存在', { code: ERROR_CODES.NOT_FOUND, status: 404 })
    }

    await noticeRepository.deleteNotice(id)
  }
}
