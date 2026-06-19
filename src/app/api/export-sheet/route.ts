import { NextRequest, NextResponse } from 'next/server'
import type { PageAuditResult, SiteAnalysis } from '@/lib/types'

export const runtime = 'nodejs'

const CHECK_IDS = ['https', 'title', 'meta-description', 'h1', 'viewport', 'canonical', 'schema', 'open-graph', 'word-count', 'image-alt']
const CHECK_LABELS = ['HTTPS', 'Title tag', 'Meta description', 'H1', 'Viewport', 'Canonical', 'Schema', 'Open Graph', 'Word count', 'Image alt']

function escape(v: string | number) {
  const s = String(v)
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s
}

function row(...cells: (string | number)[]) {
  return cells.map(escape).join(',') + '\r\n'
}

export async function POST(req: NextRequest) {
  const { pages, analysis, siteUrl } = await req.json() as {
    pages: PageAuditResult[]
    analysis: SiteAnalysis
    siteUrl: string
  }

  let csv = ''

  // ── Overview ──────────────────────────────────────────────────
  csv += row('SEO Audit Report')
  csv += row(siteUrl)
  csv += row(`Generated: ${new Date().toLocaleString('en-GB')}`)
  csv += row()
  csv += row('Site score', `${analysis.siteScore} / 100`)
  csv += row('Pages audited', analysis.totalPages)
  csv += row('Total issues', analysis.issueCount)
  csv += row()

  // ── All pages ─────────────────────────────────────────────────
  csv += row('ALL PAGES')
  csv += row('URL', 'Page type', 'Score', ...CHECK_LABELS)
  for (const p of pages) {
    csv += row(
      p.url, p.pageType, p.score,
      ...CHECK_IDS.map(id => {
        const c = p.checks.find(ch => ch.id === id)
        return c ? c.status.toUpperCase() : ''
      })
    )
  }
  csv += row()

  // ── Issues ────────────────────────────────────────────────────
  csv += row('ISSUES BY TYPE')
  csv += row('Severity', 'Issue', 'Affected pages', 'URL', 'Current value', 'Recommendation')
  for (const issue of analysis.issues) {
    const affectedPages = pages.filter(p => {
      const c = p.checks.find(ch => ch.id === issue.type)
      return c && (c.status === 'fail' || c.status === 'warn')
    })

    if (affectedPages.length > 0) {
      affectedPages.forEach((p, i) => {
        const check = p.checks.find(c => c.id === issue.type)
        csv += row(
          i === 0 ? issue.severity.toUpperCase() : '',
          i === 0 ? issue.label : '',
          i === 0 ? issue.count : '',
          p.url,
          check?.value ?? '',
          i === 0 ? (check?.recommendation ?? '') : '',
        )
      })
    } else if (issue.urls?.length) {
      issue.urls.forEach((url, i) => {
        csv += row(
          i === 0 ? issue.severity.toUpperCase() : '',
          i === 0 ? issue.label : '',
          i === 0 ? issue.count : '',
          url, '', '',
        )
      })
    }
    csv += row()
  }

  const filename = `seo-audit-${siteUrl.replace(/^https?:\/\//, '').replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
