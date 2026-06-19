import { load } from 'cheerio/slim'
import type { CheckResult } from './types'

export function runChecks(html: string, url: string): CheckResult[] {
  const $ = load(html)

  return [
    checkHttps(url),
    checkTitle($),
    checkMetaDescription($),
    checkH1($),
    checkViewport($),
    checkCanonical($, url),
    checkSchema($),
  ]
}

function checkHttps(url: string): CheckResult {
  const isHttps = url.startsWith('https://')
  return {
    id: 'https',
    label: 'HTTPS',
    status: isHttps ? 'pass' : 'fail',
    value: isHttps ? 'Secure (HTTPS)' : 'Insecure (HTTP)',
    recommendation: isHttps
      ? 'Your site is served over HTTPS — good for security and rankings.'
      : 'Migrate to HTTPS immediately. Google uses HTTPS as a ranking signal and browsers flag HTTP sites as insecure.',
  }
}

function checkTitle($: ReturnType<typeof load>): CheckResult {
  const title = $('title').first().text().trim()
  if (!title) {
    return {
      id: 'title',
      label: 'Title tag',
      status: 'fail',
      value: 'Missing',
      recommendation: 'Add a <title> tag to every page. It\'s the most important on-page SEO element and appears as the clickable headline in search results.',
    }
  }
  const len = title.length
  if (len > 60) {
    return {
      id: 'title',
      label: 'Title tag',
      status: 'warn',
      value: `${len} characters — "${title.slice(0, 60)}…"`,
      recommendation: `Your title is ${len} characters. Google typically displays up to 60 characters before truncating. Shorten it to keep your full title visible in search results.`,
    }
  }
  return {
    id: 'title',
    label: 'Title tag',
    status: 'pass',
    value: `${len} characters — "${title}"`,
    recommendation: 'Title tag length is good. Make sure it includes your primary keyword near the start.',
  }
}

function checkMetaDescription($: ReturnType<typeof load>): CheckResult {
  const desc = $('meta[name="description"]').attr('content')?.trim() ?? ''
  if (!desc) {
    return {
      id: 'meta-description',
      label: 'Meta description',
      status: 'fail',
      value: 'Missing',
      recommendation: 'Add a meta description to every page. Without one, Google writes its own snippet — which typically gets far fewer clicks. Aim for 120–155 characters.',
    }
  }
  const len = desc.length
  if (len < 120) {
    return {
      id: 'meta-description',
      label: 'Meta description',
      status: 'warn',
      value: `${len} characters — too short`,
      recommendation: `Your meta description is only ${len} characters. Expand it to 120–155 characters to use the full SERP real estate and improve click-through rates.`,
    }
  }
  if (len > 155) {
    return {
      id: 'meta-description',
      label: 'Meta description',
      status: 'warn',
      value: `${len} characters — may be truncated`,
      recommendation: `At ${len} characters, Google may truncate your meta description. Trim to under 155 characters to ensure your full message is visible.`,
    }
  }
  return {
    id: 'meta-description',
    label: 'Meta description',
    status: 'pass',
    value: `${len} characters`,
    recommendation: 'Meta description length is good. Make sure it reads as a compelling summary that encourages clicks.',
  }
}

function checkH1($: ReturnType<typeof load>): CheckResult {
  const h1s = $('h1')
  const count = h1s.length
  if (count === 0) {
    return {
      id: 'h1',
      label: 'H1 heading',
      status: 'fail',
      value: 'Missing',
      recommendation: 'Every page needs exactly one H1 tag. It tells search engines what the page is about and should include your primary keyword.',
    }
  }
  if (count > 1) {
    return {
      id: 'h1',
      label: 'H1 heading',
      status: 'warn',
      value: `${count} H1 tags found`,
      recommendation: `You have ${count} H1 tags on this page. Use exactly one H1 per page. Demote the others to H2 or H3.`,
    }
  }
  const text = h1s.first().text().trim()
  return {
    id: 'h1',
    label: 'H1 heading',
    status: 'pass',
    value: `"${text.slice(0, 60)}${text.length > 60 ? '…' : ''}"`,
    recommendation: 'One H1 found — good. Make sure it closely matches your title tag and targets your primary keyword.',
  }
}

function checkViewport($: ReturnType<typeof load>): CheckResult {
  const viewport = $('meta[name="viewport"]').attr('content')
  if (!viewport) {
    return {
      id: 'viewport',
      label: 'Mobile viewport',
      status: 'fail',
      value: 'Missing',
      recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to your <head>. Without it, mobile browsers render the page at desktop width — a poor mobile experience and a negative ranking signal.',
    }
  }
  return {
    id: 'viewport',
    label: 'Mobile viewport',
    status: 'pass',
    value: 'Viewport meta present',
    recommendation: 'Viewport meta tag is set. For a full mobile audit, run a Google PageSpeed Insights check.',
  }
}

function checkCanonical($: ReturnType<typeof load>, pageUrl: string): CheckResult {
  const canonical = $('link[rel="canonical"]').attr('href')?.trim()
  if (!canonical) {
    return {
      id: 'canonical',
      label: 'Canonical tag',
      status: 'fail',
      value: 'Missing',
      recommendation: 'Add a canonical tag to tell search engines which version of the URL is authoritative. This prevents duplicate content issues from URL variations (www vs non-www, trailing slashes, query strings).',
    }
  }
  try {
    const canonicalUrl = new URL(canonical, pageUrl)
    return {
      id: 'canonical',
      label: 'Canonical tag',
      status: 'pass',
      value: canonicalUrl.href.length > 60 ? canonicalUrl.href.slice(0, 57) + '…' : canonicalUrl.href,
      recommendation: 'Canonical tag is present. Make sure it points to the correct preferred URL for this page.',
    }
  } catch {
    return {
      id: 'canonical',
      label: 'Canonical tag',
      status: 'warn',
      value: `Invalid: "${canonical}"`,
      recommendation: 'Your canonical tag has an invalid URL. Fix it to point to the full absolute URL of this page.',
    }
  }
}

function checkSchema($: ReturnType<typeof load>): CheckResult {
  const jsonLd = $('script[type="application/ld+json"]')
  const count = jsonLd.length
  if (count === 0) {
    return {
      id: 'schema',
      label: 'Structured data',
      status: 'fail',
      value: 'No JSON-LD found',
      recommendation: 'Add JSON-LD structured data to this page. At minimum, add Organisation schema on your homepage and Article schema on blog posts. This makes you eligible for rich results in search.',
    }
  }
  return {
    id: 'schema',
    label: 'Structured data',
    status: 'pass',
    value: `${count} JSON-LD block${count > 1 ? 's' : ''} found`,
    recommendation: 'Structured data is present. Validate it at schema.org/validator to confirm it\'s error-free and eligible for rich results.',
  }
}
