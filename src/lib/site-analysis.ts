import type { PageAuditResult, SiteAnalysis, SiteIssue, PageType } from './types'

export function analyseSite(pages: PageAuditResult[]): SiteAnalysis {
  if (pages.length === 0) {
    return {
      totalPages: 0, siteScore: 0, issueCount: 0,
      pageTypeBreakdown: {} as Record<PageType, number>,
      issues: [], topIssues: [],
    }
  }

  const siteScore = Math.round(pages.reduce((s, p) => s + p.score, 0) / pages.length)

  // Page type breakdown
  const pageTypeBreakdown = pages.reduce((acc, p) => {
    acc[p.pageType] = (acc[p.pageType] ?? 0) + 1
    return acc
  }, {} as Record<PageType, number>)

  // Cross-page analysis
  const titleMap = new Map<string, string[]>()
  const metaMap = new Map<string, string[]>()

  for (const page of pages) {
    const titleCheck = page.checks.find(c => c.id === 'title')
    const metaCheck = page.checks.find(c => c.id === 'meta-description')

    if (titleCheck?.status === 'pass') {
      const titleText = titleCheck.value.replace(/^\d+ chars — "/, '').replace(/"$/, '')
      if (titleText) {
        const existing = titleMap.get(titleText) ?? []
        titleMap.set(titleText, [...existing, page.url])
      }
    }
    if (metaCheck?.status === 'pass') {
      // Use char count as proxy for duplicate detection
      const metaVal = metaCheck.value
      const existing = metaMap.get(metaVal) ?? []
      metaMap.set(metaVal, [...existing, page.url])
    }
  }

  const duplicateTitles = Array.from(titleMap.entries()).filter(([, urls]) => urls.length > 1)
  const duplicateMetas = Array.from(metaMap.entries()).filter(([, urls]) => urls.length > 1)

  // Per-check issue counts
  const checkCounts: Record<string, { fail: number; warn: number; urls: string[] }> = {}
  for (const page of pages) {
    for (const check of page.checks) {
      if (!checkCounts[check.id]) checkCounts[check.id] = { fail: 0, warn: 0, urls: [] }
      if (check.status === 'fail') {
        checkCounts[check.id].fail++
        checkCounts[check.id].urls.push(page.url)
      } else if (check.status === 'warn') {
        checkCounts[check.id].warn++
        if (check.status === 'warn') checkCounts[check.id].urls.push(page.url)
      }
    }
  }

  const checkLabels: Record<string, string> = {
    'title': 'Missing or truncated title tag',
    'meta-description': 'Missing or too-short meta description',
    'h1': 'Missing or multiple H1 tags',
    'canonical': 'Missing canonical tag',
    'schema': 'No structured data (JSON-LD)',
    'open-graph': 'Missing Open Graph tags',
    'word-count': 'Thin content (under 300 words)',
    'image-alt': 'Images missing alt text',
    'viewport': 'Missing mobile viewport meta',
    'https': 'Not served over HTTPS',
  }

  const checkSeverity: Record<string, 'high' | 'medium' | 'low'> = {
    'meta-description': 'high',
    'title': 'high',
    'schema': 'high',
    'h1': 'medium',
    'canonical': 'medium',
    'open-graph': 'medium',
    'word-count': 'medium',
    'image-alt': 'low',
    'viewport': 'low',
    'https': 'high',
  }

  const issues: SiteIssue[] = []

  for (const [id, counts] of Object.entries(checkCounts)) {
    const total = counts.fail + counts.warn
    if (total === 0) continue
    issues.push({
      type: id,
      severity: counts.fail > 0 ? (checkSeverity[id] ?? 'medium') : 'low',
      count: total,
      label: checkLabels[id] ?? id,
      urls: counts.urls.slice(0, 5),
    })
  }

  // Add duplicate title/meta issues
  if (duplicateTitles.length > 0) {
    issues.push({
      type: 'duplicate-titles',
      severity: 'medium',
      count: duplicateTitles.reduce((s, [, urls]) => s + urls.length, 0),
      label: 'Duplicate title tags across pages',
      urls: duplicateTitles.flatMap(([, urls]) => urls).slice(0, 5),
    })
  }
  if (duplicateMetas.length > 0) {
    issues.push({
      type: 'duplicate-metas',
      severity: 'medium',
      count: duplicateMetas.reduce((s, [, urls]) => s + urls.length, 0),
      label: 'Duplicate meta descriptions across pages',
      urls: duplicateMetas.flatMap(([, urls]) => urls).slice(0, 5),
    })
  }

  // Sort: high severity first, then by count
  issues.sort((a, b) => {
    const sv = { high: 0, medium: 1, low: 2 }
    return sv[a.severity] - sv[b.severity] || b.count - a.count
  })

  const topIssues = issues.slice(0, 4).map(i => `${i.count} page${i.count > 1 ? 's' : ''}: ${i.label}`)
  const issueCount = issues.reduce((s, i) => s + i.count, 0)

  return { totalPages: pages.length, siteScore, issueCount, pageTypeBreakdown, issues, topIssues }
}
