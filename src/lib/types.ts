export type CheckStatus = 'pass' | 'warn' | 'fail'

export type PageType =
  | 'homepage'
  | 'service'
  | 'blog'
  | 'product'
  | 'collection'
  | 'contact'
  | 'about'
  | 'other'

export interface CheckResult {
  id: string
  label: string
  status: CheckStatus
  value: string
  recommendation: string
}

export interface PageAuditResult {
  url: string
  pageType: PageType
  score: number
  checks: CheckResult[]
}

// Legacy single-page result (kept for /api/audit)
export interface AuditResult {
  url: string
  fetchedAt: string
  score: number
  checks: CheckResult[]
}

export interface SiteIssue {
  type: string
  severity: 'high' | 'medium' | 'low'
  count: number
  label: string
  urls?: string[]
}

export interface SiteAnalysis {
  totalPages: number
  siteScore: number
  issueCount: number
  pageTypeBreakdown: Record<PageType, number>
  issues: SiteIssue[]
  topIssues: string[]
}

// SSE event types
export type CrawlEvent =
  | { type: 'discovering' }
  | { type: 'discovered'; total: number; urls: string[] }
  | { type: 'page'; result: PageAuditResult; index: number; total: number }
  | { type: 'analysis'; analysis: SiteAnalysis }
  | { type: 'error'; message: string; code: string }

export interface AuditError {
  error: string
  code: 'INVALID_URL' | 'FETCH_FAILED' | 'TIMEOUT' | 'NOT_HTML'
}
