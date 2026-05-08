// ============================================
// LOGGER CONDICIONAL - ChaskiBots EDU
// Solo muestra logs en desarrollo
// ============================================

const isDev = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: any[]) => {
    if (isDev) console.log(...args)
  },
  info: (...args: any[]) => {
    if (isDev) console.info('[INFO]', ...args)
  },
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args)
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args)
  },
  debug: (...args: any[]) => {
    if (isDev) console.log('[DEBUG]', ...args)
  },
  api: (endpoint: string, ...args: any[]) => {
    if (isDev) console.log(`[API ${endpoint}]`, ...args)
  }
}

export default logger
