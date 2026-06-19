import { NextRequest, NextResponse } from 'next/server'
import { runChecks } from '@/lib/checker'
import { calculateScore } from '@/lib/score'
import type { AuditResult, AuditError } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 15

function err(msg: string, code: AuditError['code'], status: number) {
  return NextResponse.json<AuditError>({ error: msg, code }, { status })
}

export async function POST(req: NextRequest) {
  let body: { url?: string }
  try {
    body = await req.json()
  } catch {
    return err('Invalid request body', 'INVALID_URL', 400)
  }

  const raw = body.url?.trim() ?? ''
  if (!raw) return err('URL is required', 'INVALID_URL', 400)

  // Normalise — add https:// if no protocol provided
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`

  let parsed: URL
  try {
    parsed = new URL(withProtocol)
  } catch {
    return err('That doesn\'t look like a valid URL. Try something like example.com', 'INVALID_URL', 400)
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return err('Only HTTP and HTTPS URLs are supported', 'INVALID_URL', 400)
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  let html: string
  try {
    const res = await fetch(parsed.href, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VersantusHealthChecker/1.0; +https://versantus.co.uk)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-GB,en;q=0.9',
      },
      redirect: 'follow',
    })
    clearTimeout(timeout)

    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html')) {
      return err('The URL doesn\'t return an HTML page — we can only audit web pages, not files or APIs.', 'NOT_HTML', 422)
    }
    html = await res.text()
  } catch (e: unknown) {
    clearTimeout(timeout)
    const isAbort = e instanceof Error && e.name === 'AbortError'
    if (isAbort) {
      return err('The page took too long to respond (10s timeout). Check the URL and try again.', 'TIMEOUT', 504)
    }
    return err('Couldn\'t reach that URL. Check it\'s publicly accessible and try again.', 'FETCH_FAILED', 502)
  }

  const checks = runChecks(html, parsed.href)
  const score = calculateScore(checks)

  const result: AuditResult = {
    url: parsed.href,
    fetchedAt: new Date().toISOString(),
    score,
    checks,
  }

  return NextResponse.json<AuditResult>(result)
}
