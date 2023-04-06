export const Severities = {
  Success: 'success',
  Info: 'info',
  Warn: 'warn',
  Error: 'error',
} as const

export type Severity = (typeof Severities)[keyof typeof Severities]
