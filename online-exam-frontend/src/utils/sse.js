const createSseError = (message, status = 0) => {
  const error = new Error(message)
  error.status = status
  return error
}

const normalizeLineEndings = (value = '') => value.replace(/\r\n/g, '\n')

export const splitSseBuffer = (buffer = '') => {
  const normalized = normalizeLineEndings(buffer)
  const parts = normalized.split('\n\n')

  if (parts.length === 1) {
    return [[], normalized]
  }

  const rest = parts.pop() || ''
  const blocks = parts.filter(Boolean)
  return [blocks, rest]
}

export const parseSseBlock = (block = '') => {
  const lines = normalizeLineEndings(block).split('\n')
  let event = 'message'
  const dataLines = []

  for (const line of lines) {
    if (!line || line.startsWith(':')) {
      continue
    }

    const separatorIndex = line.indexOf(':')
    const field = separatorIndex === -1 ? line : line.slice(0, separatorIndex)
    const rawValue = separatorIndex === -1 ? '' : line.slice(separatorIndex + 1)
    const value = rawValue.startsWith(' ') ? rawValue.slice(1) : rawValue

    if (field === 'event' && value) {
      event = value
      continue
    }

    if (field === 'data') {
      dataLines.push(value)
    }
  }

  const rawData = dataLines.join('\n')
  let data = null

  if (rawData) {
    try {
      data = JSON.parse(rawData)
    } catch {
      data = rawData
    }
  }

  return { event, data }
}

export const openSseStream = async ({ url, token, signal, onOpen, onEvent } = {}) => {
  if (!url) {
    throw createSseError('实时连接地址不能为空')
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      signal
    })

    if (!response.ok) {
      throw createSseError(response.status === 401 ? '登录已失效' : '实时连接失败', response.status)
    }

    if (!response.body) {
      throw createSseError('实时连接不可用')
    }

    if (typeof onOpen === 'function') {
      await onOpen()
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const [blocks, rest] = splitSseBuffer(buffer)
        buffer = rest

        for (const block of blocks) {
          if (typeof onEvent === 'function') {
            await onEvent(parseSseBlock(block))
          }
        }
      }

      decoder.decode()
    } finally {
      reader.releaseLock?.()
    }

    if (signal?.aborted) {
      return
    }

    throw createSseError('实时连接已断开')
  } catch (error) {
    if (signal?.aborted || error?.name === 'AbortError') {
      return
    }

    throw error
  }
}
