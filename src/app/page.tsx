import URLInput from '@/components/URLInput'
import ThemeToggle from '@/components/ThemeToggle'

const checks = [
  { icon: '🔒', label: 'HTTPS',            desc: 'Security & trust',    bg: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  { icon: '🔤', label: 'Title tag',         desc: 'Length & presence',   bg: 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300' },
  { icon: '📝', label: 'Meta description',  desc: 'Snippet & CTR',       bg: 'bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300' },
  { icon: '📌', label: 'H1 heading',        desc: 'Count & content',     bg: 'bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300' },
  { icon: '📱', label: 'Mobile viewport',   desc: 'Mobile readiness',    bg: 'bg-pink-100 dark:bg-pink-500/10 text-pink-700 dark:text-pink-300' },
  { icon: '🔗', label: 'Canonical tag',     desc: 'Duplicate URLs',      bg: 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300' },
  { icon: '📊', label: 'Structured data',   desc: 'Schema / JSON-LD',    bg: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  { icon: '🌐', label: 'Open Graph',        desc: 'Social sharing',      bg: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  { icon: '📖', label: 'Content length',    desc: 'Thin content check',  bg: 'bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300' },
  { icon: '🖼️', label: 'Image alt text',   desc: 'Accessibility & SEO', bg: 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300' },
]

const stats = [
  { value: '10', label: 'SEO checks per page' },
  { value: '500', label: 'Pages per crawl' },
  { value: '100%', label: 'Free, no login' },
]

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-v-dark/80 backdrop-blur border-b border-gray-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <span className="font-heading font-bold text-lg bg-gradient-to-r from-v-pink to-v-purple bg-clip-text text-transparent">
            SiteCheck
          </span>
          <div className="flex items-center gap-3">
            <a
              href="https://versantus.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-v-pink dark:hover:text-v-pink transition-colors hidden sm:block"
            >
              by Versantus
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex-1 flex items-center justify-center overflow-hidden
        bg-gradient-to-br from-rose-50 via-white to-purple-50
        dark:from-v-dark dark:via-v-dark dark:to-v-dark">

        {/* Decorative blobs - dark only */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-v-pink/10 rounded-full blur-3xl pointer-events-none dark:opacity-100 opacity-0" />
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-v-purple/10 rounded-full blur-3xl pointer-events-none dark:opacity-100 opacity-0" />

        {/* Dot grid - dark only */}
        <div className="absolute inset-0 dot-grid pointer-events-none dark:opacity-100 opacity-0" />

        {/* Subtle grid lines - light only */}
        <div className="absolute inset-0 pointer-events-none dark:opacity-0 opacity-100"
          style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="relative z-10 w-full max-w-3xl mx-auto px-5 py-24 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8
            bg-v-pink/10 dark:bg-v-pink/15 border border-v-pink/20 text-v-pink text-sm font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-v-pink animate-pulse" />
            Free · Instant · No login required
          </div>

          <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl leading-tight mb-6
            text-gray-900 dark:text-white">
            Find what&apos;s costing your{' '}
            <span className="bg-gradient-to-r from-v-pink to-v-purple bg-clip-text text-transparent">
              website traffic
            </span>
          </h1>

          <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            Enter any URL and we&apos;ll crawl your entire site, running 10 SEO checks on every page.
          </p>

          <div className="flex justify-center">
            <URLInput />
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-v-dark2">
        <div className="max-w-3xl mx-auto px-5 py-8 grid grid-cols-3 gap-4 text-center">
          {stats.map(s => (
            <div key={s.label}>
              <p className="font-heading font-bold text-2xl sm:text-3xl bg-gradient-to-r from-v-pink to-v-purple bg-clip-text text-transparent">
                {s.value}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What we check */}
      <section className="bg-gray-50 dark:bg-v-dark border-t border-gray-200 dark:border-white/10 py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-gray-900 dark:text-white mb-2">
              What we check
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              10 signals that matter for rankings, click-through rate, and accessibility
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {checks.map(c => (
              <div key={c.label}
                className="group rounded-2xl border border-gray-200 dark:border-white/10
                  bg-white dark:bg-v-dark2 p-4 flex flex-col gap-3
                  hover:border-v-pink/50 dark:hover:border-v-pink/50
                  hover:shadow-sm transition-all duration-200">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${c.bg}`}>
                  {c.icon}
                </span>
                <div>
                  <p className="font-semibold text-sm text-gray-800 dark:text-white leading-tight">{c.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{c.desc}</p>
                </div>
              </div>
            ))}

            {/* Full site crawl card */}
            <div className="rounded-2xl border border-v-pink/30 dark:border-v-pink/20
              bg-gradient-to-br from-v-pink/5 to-v-purple/5 dark:from-v-pink/10 dark:to-v-purple/10
              p-4 flex flex-col gap-3">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl
                bg-gradient-to-br from-v-pink/20 to-v-purple/20 text-v-pink">
                🔍
              </span>
              <div>
                <p className="font-semibold text-sm text-v-pink leading-tight">Full site crawl</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Up to 500 pages</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-gradient-to-r from-v-pink to-v-purple py-14 px-5 text-center">
        <p className="font-heading font-bold text-2xl text-white mb-2">
          Built by Versantus
        </p>
        <p className="text-white/70 text-sm mb-6 max-w-sm mx-auto">
          Oxford&apos;s Drupal &amp; digital agency — helping businesses grow their organic traffic since 2003.
        </p>
        <a
          href="https://versantus.co.uk"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-white text-v-pink font-bold px-8 py-3 rounded-xl
            hover:bg-pink-50 transition-colors shadow-lg shadow-black/10"
        >
          Visit Versantus →
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-v-dark border-t border-gray-200 dark:border-white/10 py-5 px-5 text-center">
        <p className="text-gray-400 dark:text-gray-600 text-xs">
          © {new Date().getFullYear()} Versantus Ltd · Free to use · No data stored
        </p>
      </footer>

    </div>
  )
}
