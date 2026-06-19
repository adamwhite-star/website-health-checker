import { NextRequest } from 'next/server'
import { discoverUrls, detectPageType, fetchHtml } from '@/lib/crawler'
import { runChecks } from '@/lib/checker'
import { calculateScore } from '@/lib/score'
import { analyseSite } from '@/lib/site-analysis'
import type { CrawlEvent, PageAuditResult } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 300

function send(controller: ReadableStreamDefaultController, event: CrawlEvent) {
  const line = `data: ${JSON.stringify(event)}\n\n`
  controller.enqueue(new TextEncoder().encode(line))
}

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get('url')

  if (!rawUrl) {
    return new Response('Missing url parameter', { status: 400 })
  }

  let inputUrl: string
  try {
    const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`)
    inputUrl = parsed.href
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid URL', code: 'INVALID_URL' }), { status: 400 })
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        send(controller, { type: 'discovering' })

        const { urls, source } = await discoverUrls(inputUrl)

        if (urls.length === 0) {
          send(controller, { type: 'error', message: 'Could not discover any pages. Check the URL is publicly accessible.', code: 'FETCH_FAILED' })
          controller.close()
          return
        }

        send(controller, { type: 'discovered', total: urls.length, urls })

        const results: PageAuditResult[] = []

        for (let i = 0; i < urls.length; i++) {
          const url = urls[i]
          const html = await fetchHtml(url)

          if (!html) continue

          const checks = runChecks(html, url)
          const score = calculateScore(checks)
          const pageType = detectPageType(url)

          const result: PageAuditResult = { url, pageType, score, checks }
          results.push(result)

          send(controller, { type: 'page', result, index: i + 1, total: urls.length })
        }

        const analysis = analyseSite(results)
        send(controller, { type: 'analysis', analysis })

        void source
      } catch (err) {
        send(controller, {
          type: 'error',
          message: err instanceof Error ? err.message : 'Unexpected error',
          code: 'FETCH_FAILED',
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
