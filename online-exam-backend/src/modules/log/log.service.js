import { logRepository } from './log.repository.js'
import { parsePagination, buildPageResult } from '../../common/utils/pagination.js'
import { formatDateTime } from '../../common/utils/datetime.js'

const mapLog = (log) => ({
  id: log.id,
  username: log.usernameSnapshot,
  ip: log.ip,
  location: log.location,
  browser: log.browser,
  os: log.os,
  status: log.status,
  message: log.message,
  loginTime: formatDateTime(log.loginTime)
})

export const logService = {
  async listLogs(query) {
    const { pageNum, pageSize, skip, take } = parsePagination(query)
    const where = {}

    if (query.username) {
      where.usernameSnapshot = { contains: query.username }
    }

    if (query.status !== undefined) {
      where.status = Number(query.status)
    }

    const [total, list] = await Promise.all([
      logRepository.countLogs(where),
      logRepository.findLogs({ where, skip, take })
    ])

    return buildPageResult({
      list: list.map(mapLog),
      total,
      pageNum,
      pageSize
    })
  },

  async clearLogs() {
    await logRepository.clearLogs()
  }
}
