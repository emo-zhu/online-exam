export const parsePagination = (query = {}) => {
  const pageNum = Math.max(Number(query.pageNum) || 1, 1)
  const pageSize = Math.min(Math.max(Number(query.pageSize) || 10, 1), 100)
  const skip = (pageNum - 1) * pageSize

  return {
    pageNum,
    pageSize,
    skip,
    take: pageSize
  }
}

export const buildPageResult = ({ list, total, pageNum, pageSize }) => ({
  list,
  total,
  pageNum,
  pageSize
})
