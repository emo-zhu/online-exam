const units = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000
}

export const parseDurationToMs = (value, fallback = 0) => {
  if (typeof value === 'number') {
    return value
  }

  const match = /^([0-9]+)([smhd])$/.exec(String(value || '').trim())
  if (!match) {
    return fallback
  }

  return Number(match[1]) * units[match[2]]
}

export const parseDurationToSeconds = (value, fallback = 0) => {
  const milliseconds = parseDurationToMs(value, fallback * 1000)
  return Math.floor(milliseconds / 1000)
}
