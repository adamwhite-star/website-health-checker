import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import type { PageAuditResult, SiteAnalysis } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 60

const CHECK_IDS = ['https', 'title', 'meta-description', 'h1', 'viewport', 'canonical', 'schema', 'open-graph', 'word-count', 'image-alt']
const CHECK_LABELS = ['HTTPS', 'Title tag', 'Meta description', 'H1', 'Viewport', 'Canonical', 'Schema', 'Open Graph', 'Word count', 'Image alt']

const ISSUE_SHEET_NAMES: Record<string, string> = {
  'https': 'HTTPS Issues',
  'title': 'Title Issues',
  'meta-description': 'Meta Description Issues',
  'h1': 'H1 Issues',
  'viewport': 'Viewport Issues',
  'canonical': 'Canonical Issues',
  'schema': 'Schema Issues',
  'open-graph': 'Open Graph Issues',
  'word-count': 'Thin Content',
  'image-alt': 'Image Alt Issues',
  'duplicate-titles': 'Duplicate Titles',
  'duplicate-metas': 'Duplicate Meta Desc',
}

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!email || !key) return null

  return new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
  })
}

function statusEmoji(status: string) {
  return status === 'pass' ? '✓' : status === 'warn' ? '⚠' : '✗'
}

function scoreColor(score: number): { red: number; green: number; blue: number } {
  if (score >= 70) return { red: 0.12, green: 0.73, blue: 0.36 }
  if (score >= 40) return { red: 1, green: 0.72, blue: 0 }
  return { red: 0.94, green: 0.08, blue: 0.43 }
}

export async function POST(req: NextRequest) {
  const auth = getAuth()
  if (!auth) {
    return NextResponse.json({ error: 'Google Sheets not configured. Add GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY to your environment.' }, { status: 503 })
  }

  const body = await req.json() as { pages: PageAuditResult[]; analysis: SiteAnalysis; siteUrl: string }
  const { pages, analysis, siteUrl } = body

  const sheets = google.sheets({ version: 'v4', auth })
  const drive = google.drive({ version: 'v3', auth })

  // --- Create spreadsheet with all needed sheets upfront ---
  const issueSheetNames: string[] = []
  for (const issue of analysis.issues) {
    const name = ISSUE_SHEET_NAMES[issue.type] ?? issue.label.slice(0, 40)
    issueSheetNames.push(name)
  }

  const sheetTitles = ['Overview', 'All Pages', ...issueSheetNames]
  const createRes = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: `SEO Audit — ${siteUrl.replace(/^https?:\/\//, '')} — ${new Date().toLocaleDateString('en-GB')}` },
      sheets: sheetTitles.map((title, i) => ({
        properties: { sheetId: i, index: i, title },
      })),
    },
  })

  const spreadsheetId = createRes.data.spreadsheetId!
  const sheetData = createRes.data.sheets!

  // Make publicly readable
  await drive.permissions.create({
    fileId: spreadsheetId,
    requestBody: { role: 'reader', type: 'anyone' },
  })

  // Helper: get sheetId by title
  const sheetId = (title: string) => sheetData.find(s => s.properties?.title === title)?.properties?.sheetId ?? 0

  // Build all batchUpdate requests (formatting) and data (valueRange) in one go
  const dataRequests: Array<{ range: string; values: (string | number | null)[][] }> = []
  const formatRequests: object[] = []

  // ----- OVERVIEW sheet -----
  const overviewData = [
    ['SEO Audit Report'],
    [siteUrl],
    [`Generated: ${new Date().toLocaleString('en-GB')}`],
    [],
    ['Site Score', `${analysis.siteScore} / 100`],
    ['Pages Audited', analysis.totalPages],
    ['Total Issues', analysis.issueCount],
    [],
    ['Page Type Breakdown'],
    ...Object.entries(analysis.pageTypeBreakdown).map(([t, c]) => [t, c]),
    [],
    ['Top Issues'],
    ...analysis.topIssues.map(i => [i]),
  ]
  dataRequests.push({ range: 'Overview!A1', values: overviewData })
  formatRequests.push(
    // Title row bold + large
    { repeatCell: { range: { sheetId: sheetId('Overview'), startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 2 }, cell: { userEnteredFormat: { textFormat: { bold: true, fontSize: 16 } } }, fields: 'userEnteredFormat.textFormat' } },
    // Section headers bold
    ...([4, 8, 11]).map(r => ({ repeatCell: { range: { sheetId: sheetId('Overview'), startRowIndex: r, endRowIndex: r + 1, startColumnIndex: 0, endColumnIndex: 1 }, cell: { userEnteredFormat: { textFormat: { bold: true } } }, fields: 'userEnteredFormat.textFormat' } })),
  )

  // ----- ALL PAGES sheet -----
  const allPagesHeader = ['URL', 'Page Type', 'Score', ...CHECK_LABELS]
  const allPagesRows = pages.map(p => [
    p.url,
    p.pageType,
    p.score,
    ...CHECK_IDS.map(id => {
      const c = p.checks.find(ch => ch.id === id)
      return c ? `${statusEmoji(c.status)} ${c.value}` : '—'
    }),
  ])
  dataRequests.push({ range: 'All Pages!A1', values: [allPagesHeader, ...allPagesRows] })
  // Header row styling
  formatRequests.push(
    { repeatCell: { range: { sheetId: sheetId('All Pages'), startRowIndex: 0, endRowIndex: 1 }, cell: { userEnteredFormat: { textFormat: { bold: true }, backgroundColor: { red: 0.94, green: 0.08, blue: 0.43 } } }, fields: 'userEnteredFormat(textFormat,backgroundColor)' } },
    // Freeze header
    { updateSheetProperties: { properties: { sheetId: sheetId('All Pages'), gridProperties: { frozenRowCount: 1 } }, fields: 'gridProperties.frozenRowCount' } },
  )
  // Score column colour per row
  allPagesRows.forEach((row, i) => {
    const score = row[2] as number
    const c = scoreColor(score)
    formatRequests.push({ repeatCell: { range: { sheetId: sheetId('All Pages'), startRowIndex: i + 1, endRowIndex: i + 2, startColumnIndex: 2, endColumnIndex: 3 }, cell: { userEnteredFormat: { backgroundColor: { ...c, alpha: 0.3 } } }, fields: 'userEnteredFormat.backgroundColor' } })
  })

  // ----- ISSUE sheets -----
  for (const issue of analysis.issues) {
    const sheetName = ISSUE_SHEET_NAMES[issue.type] ?? issue.label.slice(0, 40)
    const sid = sheetId(sheetName)
    const affectedPages = pages.filter(p => {
      const check = p.checks.find(c => c.id === issue.type)
      return check && (check.status === 'fail' || check.status === 'warn')
    })

    const header = ['URL', 'Page Type', 'Score', 'Status', 'Value', 'Recommendation']
    const rows = affectedPages.map(p => {
      const check = p.checks.find(c => c.id === issue.type)
      return [p.url, p.pageType, p.score, check?.status ?? '', check?.value ?? '', check?.recommendation ?? '']
    })

    // For cross-page issues (duplicate-titles, duplicate-metas), list the affected URLs
    if (affectedPages.length === 0 && issue.urls && issue.urls.length > 0) {
      const urlRows = issue.urls.map(u => [u])
      dataRequests.push({ range: `'${sheetName}'!A1`, values: [['Affected URLs'], ...urlRows] })
    } else {
      dataRequests.push({ range: `'${sheetName}'!A1`, values: [header, ...rows] })
    }

    formatRequests.push(
      { repeatCell: { range: { sheetId: sid, startRowIndex: 0, endRowIndex: 1 }, cell: { userEnteredFormat: { textFormat: { bold: true }, backgroundColor: { red: 0.94, green: 0.08, blue: 0.43 } } }, fields: 'userEnteredFormat(textFormat,backgroundColor)' } },
      { updateSheetProperties: { properties: { sheetId: sid, gridProperties: { frozenRowCount: 1 } }, fields: 'gridProperties.frozenRowCount' } },
    )
  }

  // Batch write data
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: 'RAW', data: dataRequests },
  })

  // Batch formatting
  if (formatRequests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: formatRequests },
    })
  }

  // Auto-resize all sheets
  const resizeRequests = sheetData.map(s => ({
    autoResizeDimensions: { dimensions: { sheetId: s.properties?.sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 15 } },
  }))
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: resizeRequests },
  })

  return NextResponse.json({ url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}` })
}
