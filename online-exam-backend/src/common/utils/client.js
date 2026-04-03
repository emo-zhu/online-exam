export const parseClientInfo = (ctx) => {
  const userAgent = ctx.get('user-agent') || ''
  const browser = userAgent.includes('Chrome')
    ? 'Chrome'
    : userAgent.includes('Firefox')
      ? 'Firefox'
      : userAgent.includes('Safari')
        ? 'Safari'
        : userAgent.includes('Edge')
          ? 'Edge'
          : 'Unknown'

  const os = userAgent.includes('Windows')
    ? 'Windows'
    : userAgent.includes('Mac OS') || userAgent.includes('Macintosh')
      ? 'macOS'
      : userAgent.includes('Android')
        ? 'Android'
        : userAgent.includes('Linux')
          ? 'Linux'
          : 'Unknown'

  return {
    ip: ctx.ip || '127.0.0.1',
    location: '未知',
    browser,
    os
  }
}
