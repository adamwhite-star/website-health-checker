import { load } from 'cheerio/slim'
import type { PageType } from './types'

const MAX_PAGES = 500
const FETCH_TIMEOUT = 8000
const USER_AGENT = 'Mozilla/5.0 (compatible; VersantusHealthChecker/2.0; +https://versantus.co.uk)'

function detectPageType(url: string): PageType {
  try {
    const { pathname } = new URL(url)
    const p = pathname.toLowerCase()

    if (p === '/' || p === '') return 'homepage'
    if (/\/(blog|news|articles?|insights?|posts?|journal)\b/.test(p)) return 'blog'
    if (/\/(services?|what-we-do|solutions?|capabilities)\b/.test(p)) return 'service'
    if (/\/(products?|shop|item|goods)\b/.test(p)) return 'product'
    if (/\/(collections?|category|categories|departments?|range)\b/.test(p)) return 'collection'
    if (/\/(contact|get-in-touch|reach-us|enquir)\b/.test(p)) return 'contact'
    if (/\/(about|team|who-we-are|our-story|company|people)\b/.test(p)) return 'about'
    return 'other'
  } catch {
    return 'other'
  }
}

async function fetchHtml(url: string): Promise<string | null> {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, 'Accept': 'text/html', 'Accept-Language': 'en-GB' },
      redirect: 'follow',
    })
    clearTimeout(t)
    const ct = res.headers.get('content-type') ?? ''
    if (!ct.includes('text/html')) return null
    return await res.text()
  } catch {
    clearTimeout(t)
    return null
  }
}

function extractSitemapUrls(xml: string, origin: string): string[] {
  // Handle sitemap index (links to other sitemaps)
  const sitemapLocs = Array.from(xml.matchAll(/<sitemap>[\s\S]*?<loc>(.*?)<\/loc>/gi))
    .map(m => m[1].trim())
    .filter(Boolean)

  // Handle regular sitemap
  const pageLocs = Array.from(xml.matchAll(/<url>[\s\S]*?<loc>(.*?)<\/loc>/gi))
    .map(m => m[1].trim())
    .filter(Boolean)

  const allLocs = [...pageLocs, ...sitemapLocs]
  return allLocs
    .filter(u => {
      try { return new URL(u).origin === origin } catch { return false }
    })
    .filter(u => !u.match(/\.(jpg|jpeg|png|gif|svg|webp|pdf|zip|xml|css|js)(\?|$)/i))
}

function extractPageLinks(html: string, baseUrl: string, origin: string): string[] {
  const $ = load(html)
  const links: Set<string> = new Set()

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')?.trim()
    if (!href) return
    try {
      const resolved = new URL(href, baseUrl)
      if (resolved.origin !== origin) return
      if (resolved.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|pdf|zip|xml|css|js)$/i)) return
      // Normalise: strip hash and trailing slash variations
      resolved.hash = ''
      const clean = resolved.href.replace(/\/$/, '') || origin + '/'
      links.add(clean)
    } catch { /* ignore */ }
  })

  return Array.from(links)
}

async function fetchSitemapUrls(origin: string): Promise<string[]> {
  // Try sitemap.xml, then robots.txt for sitemap pointer
  const sitemapUrl = `${origin}/sitemap.xml`
  const html = await fetchHtml(sitemapUrl)
  if (html && html.includes('<loc>')) {
    const urls = extractSitemapUrls(html, origin)
    if (urls.length > 0) return urls
  }

  // Try robots.txt for Sitemap: directive
  const robotsHtml = await fetchHtml(`${origin}/robots.txt`)
  if (robotsHtml) {
    const match = robotsHtml.match(/^Sitemap:\s*(.+)$/im)
    if (match) {
      const altSitemap = await fetchHtml(match[1].trim())
      if (altSitemap && altSitemap.includes('<loc>')) {
        const urls = extractSitemapUrls(altSitemap, origin)
        if (urls.length > 0) return urls
      }
    }
  }

  return []
}

async function crawlByLinks(startUrl: string, origin: string): Promise<string[]> {
  const visited = new Set<string>()
  const queue: Array<{ url: string; depth: number }> = [{ url: startUrl, depth: 0 }]
  const discovered: string[] = []

  while (queue.length > 0 && discovered.length < MAX_PAGES) {
    const item = queue.shift()!
    const norm = item.url.replace(/\/$/, '') || origin + '/'
    if (visited.has(norm)) continue
    visited.add(norm)
    discovered.push(item.url)

    if (item.depth >= 2) continue

    const html = await fetchHtml(item.url)
    if (!html) continue
    const links = extractPageLinks(html, item.url, origin)
    for (const link of links) {
      const normLink = link.replace(/\/$/, '') || origin + '/'
      if (!visited.has(normLink)) {
        queue.push({ url: link, depth: item.depth + 1 })
      }
    }
  }

  return discovered
}

export async function discoverUrls(inputUrl: string): Promise<{
  urls: string[]
  source: 'sitemap' | 'crawl'
  origin: string
  startUrl: string
}> {
  const parsed = new URL(inputUrl)
  const origin = parsed.origin
  const startUrl = inputUrl

  // Try sitemap first — much faster and complete
  const sitemapUrls = await fetchSitemapUrls(origin)
  if (sitemapUrls.length > 0) {
    // Always include homepage
    const home = origin + '/'
    const all = [home, ...sitemapUrls.filter(u => u !== home && u !== origin)]
    const deduped = Array.from(new Set(all)).slice(0, MAX_PAGES)
    return { urls: deduped, source: 'sitemap', origin, startUrl }
  }

  // Fallback: crawl by following links
  const crawledUrls = await crawlByLinks(startUrl, origin)
  return { urls: crawledUrls.slice(0, MAX_PAGES), source: 'crawl', origin, startUrl }
}

export { detectPageType, fetchHtml }
