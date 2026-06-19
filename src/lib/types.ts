export type CheckStatus = 'pass' | 'warn' | 'fail'

export interface CheckResult {
  id: string
  label: string
  status: CheckStatus
  value: string
  recommendation: string
}

export interface AuditResult {
  url: string
  fetchedAt: string
  score: number
  checks: CheckResult[]
}

export interface AuditError {
  error: string
  code: 'INVALID_URL' | 'FETCH_FAILED' | 'TIMEOUT' | 'NOT_HTML'
}
