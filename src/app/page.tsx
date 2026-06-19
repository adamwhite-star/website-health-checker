import URLInput from '@/components/URLInput'

const checks = [
  { icon: '🔤', label: 'Title tag', desc: 'Length & presence' },
  { icon: '📝', label: 'Meta description', desc: 'Length & presence' },
  { icon: '📌', label: 'H1 heading', desc: 'Count & content' },
  { icon: '📱', label: 'Mobile viewport', desc: 'Mobile readiness' },
  { icon: '🔗', label: 'Canonical tag', desc: 'Duplicate content' },
  { icon: '🔒', label: 'HTTPS', desc: 'Security check' },
  { icon: '📊', label: 'Structured data', desc: 'Schema / JSON-LD' },
  { icon: '🌐', label: 'Open Graph', desc: 'Social sharing tags' },
  { icon: '📖', label: 'Content length', desc: 'Thin content check' },
  { icon: '🖼️', label: 'Image alt text', desc: 'Accessibility & SEO' },
]

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-v-dark min-h-[60vh] flex items-center">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-v-pink/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-20 w-96 h-96 bg-v-purple/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6
            bg-white/5 border border-white/10 text-sm text-gray-300">
            <span className="w-2 h-2 rounded-full bg-v-pink animate-pulse" />
            Free · Instant · No login required
          </div>

          <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl text-white mb-6 leading-tight">
            Is your website{' '}
            <span className="bg-gradient-to-r from-v-pink to-v-purple bg-clip-text text-transparent">
              losing traffic
            </span>{' '}
            you don&apos;t know about?
          </h1>

          <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Enter any URL for a free instant SEO health check.
            We&apos;ll crawl your entire site and audit 10 SEO signals across every page.
          </p>

          <div className="flex justify-center">
            <URLInput />
          </div>
        </div>
      </section>

      {/* What we check */}
      <section className="bg-v-dark2 border-t border-white/5 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading font-semibold text-white text-center text-2xl mb-2">
            What we check
          </h2>
          <p className="text-gray-400 text-center text-sm mb-10">
            10 checks across every page — title tags to structured data
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {checks.map(c => (
              <div key={c.label}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-1 hover:border-v-pink/40 transition-colors">
                <span className="text-2xl">{c.icon}</span>
                <span className="text-white text-sm font-semibold">{c.label}</span>
                <span className="text-gray-500 text-xs">{c.desc}</span>
              </div>
            ))}
            <div className="rounded-xl border border-v-pink/20 bg-v-pink/5 p-4 flex flex-col gap-1">
              <span className="text-2xl">🔍</span>
              <span className="text-v-pink text-sm font-semibold">Full site crawl</span>
              <span className="text-gray-500 text-xs">Up to 50 pages</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-v-dark border-t border-white/5 py-8 px-6 text-center">
        <p className="text-gray-500 text-sm">
          Built by{' '}
          <a href="https://versantus.co.uk" target="_blank" rel="noopener noreferrer"
            className="text-v-pink hover:underline">Versantus
          </a>
          {' '}— Oxford&apos;s Drupal &amp; digital agency
        </p>
      </footer>
    </main>
  )
}
