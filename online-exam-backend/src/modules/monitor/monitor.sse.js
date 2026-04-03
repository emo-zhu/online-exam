const SSE_HEADERS = Object.freeze({
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
  'X-Accel-Buffering': 'no'
})

const normalizeEventId = (value) => {
  if (value === null || value === undefined) {
    return null
  }

  return String(value)
}

export const toSseChunk = (event, data) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`

export const createMonitorChangeEvent = (type, { paperId = null, studentId = null } = {}) => ({
  type,
  paperId: normalizeEventId(paperId),
  studentId: normalizeEventId(studentId),
  timestamp: new Date().toISOString()
})

export class MonitorSseHub {
  constructor({ heartbeatInterval = 15_000 } = {}) {
    this.clients = new Map()
    this.heartbeatInterval = heartbeatInterval
    this.heartbeatTimer = null
  }

  subscribe({ res, userId = null }) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    this.clients.set(id, { id, res, userId })
    this.ensureHeartbeat()
    this.writeClient(id, 'connected', {
      type: 'connected',
      timestamp: new Date().toISOString()
    })

    return () => {
      this.clients.delete(id)
      if (this.clients.size === 0 && this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer)
        this.heartbeatTimer = null
      }
    }
  }

  broadcastChange(payload) {
    this.broadcast('monitor_changed', payload)
  }

  broadcast(event, payload) {
    for (const client of this.clients.values()) {
      if (client.res.writableEnded) {
        this.clients.delete(client.id)
        continue
      }

      try {
        client.res.write(toSseChunk(event, payload))
      } catch {
        this.clients.delete(client.id)
      }
    }
  }

  writeClient(id, event, payload) {
    const client = this.clients.get(id)
    if (!client || client.res.writableEnded) {
      this.clients.delete(id)
      return
    }

    client.res.write(toSseChunk(event, payload))
  }

  ensureHeartbeat() {
    if (this.heartbeatTimer || this.clients.size === 0) {
      return
    }

    this.heartbeatTimer = setInterval(() => {
      this.broadcast('heartbeat', {
        type: 'heartbeat',
        timestamp: new Date().toISOString()
      })
    }, this.heartbeatInterval)
  }
}

export const monitorSseHub = new MonitorSseHub()
export { SSE_HEADERS }
