import * as XLSX from 'xlsx'
import { buildPageResult, parsePagination } from '../../common/utils/pagination.js'
import { formatDateTime } from '../../common/utils/datetime.js'
import { toBigIntId } from '../../common/utils/ids.js'
import { scoreRepository } from './score.repository.js'
import { subjectService } from '../subject/subject.service.js'

const getSubjectName = (subject, subjectNameMap = new Map()) => subjectNameMap.get(subject) || subject || ''

const buildScoreWhere = (query = {}) => {
  const where = {
    status: 2,
    submitTime: { not: null }
  }

  if (query.paperId) {
    where.paperId = toBigIntId(query.paperId, 'paperId')
  }

  const keyword = query.keyword?.trim()
  if (keyword) {
    where.OR = [
      {
        student: {
          is: {
            realName: { contains: keyword }
          }
        }
      },
      {
        classNameSnapshot: { contains: keyword }
      }
    ]
  }

  return where
}

const mapScoreItem = (record, subjectNameMap = new Map()) => ({
  id: record.id,
  recordId: record.id,
  examId: record.paperId,
  examName: record.examNameSnapshot,
  paperName: record.examNameSnapshot,
  subject: record.subjectSnapshot,
  subjectName: getSubjectName(record.subjectSnapshot, subjectNameMap),
  studentId: record.studentId,
  studentName: record.student?.realName || '',
  className: record.classNameSnapshot,
  score: record.totalScore,
  passStatus: record.totalScore >= 60 ? 1 : 0,
  submitTime: formatDateTime(record.submitTime)
})

const buildStats = (records) => {
  if (!records.length) {
    return null
  }

  const scores = records.map((item) => Number(item.totalScore || 0))
  const total = scores.length
  const totalScore = scores.reduce((sum, item) => sum + item, 0)
  const passCount = scores.filter((item) => item >= 60).length

  return {
    total,
    avgScore: Math.round(totalScore / total),
    maxScore: Math.max(...scores),
    minScore: Math.min(...scores),
    passRate: Math.round((passCount / total) * 100),
    distribution: {
      excellent: scores.filter((item) => item >= 90).length,
      good: scores.filter((item) => item >= 80 && item < 90).length,
      average: scores.filter((item) => item >= 60 && item < 80).length,
      poor: scores.filter((item) => item < 60).length
    }
  }
}

const buildExportFilename = (records) => {
  const baseName = records[0]?.examNameSnapshot || '成绩单'
  return `${baseName.replace(/[\\/:*?"<>|]/g, '-')}.xlsx`
}

const buildExportBuffer = (records, subjectNameMap = new Map()) => {
  const headers = ['排名', '姓名', '班级', '科目', '分数', '状态', '交卷时间']
  const rows = records.map((item, index) => ({
    排名: index + 1,
    姓名: item.student?.realName || '',
    班级: item.classNameSnapshot,
    科目: getSubjectName(item.subjectSnapshot, subjectNameMap),
    分数: Number(item.totalScore || 0),
    状态: Number(item.totalScore || 0) >= 60 ? '合格' : '不合格',
    交卷时间: formatDateTime(item.submitTime)
  }))

  const worksheet = XLSX.utils.aoa_to_sheet([headers])
  if (rows.length > 0) {
    XLSX.utils.sheet_add_json(worksheet, rows, {
      origin: 'A2',
      skipHeader: true
    })
  }

  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 14 },
    { wch: 18 },
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 22 }
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '成绩单')

  return XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx'
  })
}

export const scoreService = {
  async listScores(query) {
    const { pageNum, pageSize, skip, take } = parsePagination(query)
    const where = buildScoreWhere(query)

    const [total, list] = await Promise.all([
      scoreRepository.countScores(where),
      scoreRepository.findScores({ where, skip, take })
    ])
    const subjectNameMap = await subjectService.getSubjectNameMap(list.map((item) => item.subjectSnapshot))

    return buildPageResult({
      list: list.map((item) => mapScoreItem(item, subjectNameMap)),
      total,
      pageNum,
      pageSize
    })
  },

  async getScoreStats(query) {
    const where = buildScoreWhere(query)
    const list = await scoreRepository.findScoresForStats(where)
    return buildStats(list)
  },

  async exportScores(query) {
    const where = buildScoreWhere(query)
    const list = await scoreRepository.findScoresForExport(where)
    const subjectNameMap = await subjectService.getSubjectNameMap(list.map((item) => item.subjectSnapshot))

    return {
      filename: buildExportFilename(list),
      buffer: buildExportBuffer(list, subjectNameMap)
    }
  }
}
