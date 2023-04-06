import { Severity } from '..'

interface Notification {
  severity: Severity
  summary: string
  detail?: string
  link?: string
  life?: number
  showAgain?: boolean
  showAgainSeconds?: number
  shownAt?: Date
}

export { Notification }
