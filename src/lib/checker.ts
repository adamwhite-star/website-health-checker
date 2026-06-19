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
    checkOpenGraph($),
    checkWordCount($),
    checkImageAltText($),
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
      value: `${len} chars — "${title.slice(0, 55)}…"`,
      recommendation: `Your title is ${len} characters. Google typically displays up to 60 characters before truncating. Shorten it to keep your full title visible in search results.`,
    }
  }
  return {
    id: 'title',
    label: 'Title tag',
    status: 'pass',
    value: `${len} chars — "${title}"`,
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
      value: `${len} chars — too short`,
      recommendation: `Your meta description is only ${len} characters. Expand it to 120–155 characters to use the full SERP real estate and improve click-through rates.`,
    }
  }
  if (len > 155) {
    return {
      id: 'meta-description',
      label: 'Meta description',
      status: 'warn',
      value: `${len} chars — may be truncated`,
      recommendation: `At ${len} characters, Google may truncate your meta description. Trim to under 155 characters to ensure your full message is visible.`,
    }
  }
  return {
    id: 'meta-description',
    label: 'Meta description',
    status: 'pass',
    value: `${len} chars`,
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
    value: `"${text.slice(0, 55)}${text.length > 55 ? '…' : ''}"`,
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
      recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to your <head>. Without it, mobile browsers render the page at desktop width.',
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
      recommendation: 'Add a canonical tag to tell search engines which version of this URL is authoritative. Prevents duplicate content from URL variations (www vs non-www, trailing slashes, query strings).',
    }
  }
  try {
    const canonicalUrl = new URL(canonical, pageUrl)
    return {
      id: 'canonical',
      label: 'Canonical tag',
      status: 'pass',
      value: canonicalUrl.href.length > 55 ? canonicalUrl.href.slice(0, 52) + '…' : canonicalUrl.href,
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
  const count = $('script[type="application/ld+json"]').length
  if (count === 0) {
    return {
      id: 'schema',
      label: 'Structured data',
      status: 'fail',
      value: 'No JSON-LD found',
      recommendation: 'Add JSON-LD structured data. At minimum: Organisation schema on your homepage, Article schema on blog posts, Product schema on product pages. This makes you eligible for rich results.',
    }
  }
  return {
    id: 'schema',
    label: 'Structured data',
    status: 'pass',
    value: `${count} JSON-LD block${count > 1 ? 's' : ''} found`,
    recommendation: 'Structured data is present. Validate it at schema.org/validator to confirm eligibility for rich results.',
  }
}

function checkOpenGraph($: ReturnType<typeof load>): CheckResult {
  const ogTitle = $('meta[property="og:title"]').attr('content')?.trim()
  const ogDesc = $('meta[property="og:description"]').attr('content')?.trim()
  const ogImage = $('meta[property="og:image"]').attr('content')?.trim()

  const present = [ogTitle, ogDesc, ogImage].filter(Boolean).length

  if (present === 0) {
    return {
      id: 'open-graph',
      label: 'Open Graph tags',
      status: 'fail',
      value: 'None found',
      recommendation: 'Add Open Graph tags (og:title, og:description, og:image) so this page renders correctly when shared on LinkedIn, Facebook, Slack, and other platforms.',
    }
  }
  if (present < 3) {
    const missing = [
      !ogTitle && 'og:title',
      !ogDesc && 'og:description',
      !ogImage && 'og:image',
    ].filter(Boolean).join(', ')
    return {
      id: 'open-graph',
      label: 'Open Graph tags',
      status: 'warn',
      value: `${present}/3 tags — missing: ${missing}`,
      recommendation: `Add the missing Open Graph tags: ${missing}. These control how the page appears when shared on social media and messaging apps.`,
    }
  }
  return {
    id: 'open-graph',
    label: 'Open Graph tags',
    status: 'pass',
    value: 'og:title, og:description, og:image all present',
    recommendation: 'All key Open Graph tags are set. The page will render correctly when shared on social media.',
  }
}

function checkWordCount($: ReturnType<typeof load>): CheckResult {
  // Remove nav, header, footer, scripts, styles, and count body text
  $('script, style, nav, header, footer, aside, [role="navigation"], [role="banner"], [role="contentinfo"]').remove()
  const text = $('body').text().replace(/\s+/g, ' ').trim()
  const wordCount = text.split(' ').filter(w => w.length > 1).length

  if (wordCount < 100) {
    return {
      id: 'word-count',
      label: 'Content length',
      status: 'fail',
      value: `~${wordCount} words — very thin`,
      recommendation: `This page has very little content (~${wordCount} words). Google may consider it thin content and rank it poorly. Aim for at least 300 words of useful, substantive content.`,
    }
  }
  if (wordCount < 300) {
    return {
      id: 'word-count',
      label: 'Content length',
      status: 'warn',
      value: `~${wordCount} words`,
      recommendation: `At ~${wordCount} words, this page is on the thin side. For pages targeting competitive keywords, aim for 500+ words of substantive content.`,
    }
  }
  return {
    id: 'word-count',
    label: 'Content length',
    status: 'pass',
    value: `~${wordCount} words`,
    recommendation: 'Content length looks healthy. Make sure the content is genuinely useful and answers the user\'s intent — length alone isn\'t enough.',
  }
}

function checkImageAltText($: ReturnType<typeof load>): CheckResult {
  const images = $('img')
  const total = images.length

  if (total === 0) {
    return {
      id: 'image-alt',
      label: 'Image alt text',
      status: 'pass',
      value: 'No images found',
      recommendation: 'No images detected. If you add images in future, make sure each has a descriptive alt attribute.',
    }
  }

  let missing = 0
  images.each((_, el) => {
    const alt = $(el).attr('alt')
    if (alt === undefined || alt.trim() === '') missing++
  })

  if (missing === 0) {
    return {
      id: 'image-alt',
      label: 'Image alt text',
      status: 'pass',
      value: `All ${total} image${total > 1 ? 's' : ''} have alt text`,
      recommendation: 'All images have alt text — good for accessibility and image search SEO.',
    }
  }
  if (missing / total > 0.5) {
    return {
      id: 'image-alt',
      label: 'Image alt text',
      status: 'fail',
      value: `${missing}/${total} images missing alt text`,
      recommendation: `${missing} of ${total} images have no alt text. Add descriptive alt attributes to all images — this affects both accessibility (WCAG compliance) and image search rankings.`,
    }
  }
  return {
    id: 'image-alt',
    label: 'Image alt text',
    status: 'warn',
    value: `${missing}/${total} images missing alt text`,
    recommendation: `${missing} image${missing > 1 ? 's are' : ' is'} missing alt text. Add descriptive alt attributes to improve accessibility and image search SEO.`,
  }
}
