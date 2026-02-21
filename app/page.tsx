import Link from 'next/link'
import { ArrowRight, Database, ShieldCheck, Zap, Cloud } from 'lucide-react'

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-32 pb-20 px-6 sm:px-12 z-10 relative">
      <div className="glow-bg"></div>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center mt-10 space-y-8 relative z-10">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-500 pb-2">
          Automate Certificate <br /> Generation at Scale
        </h1>
        <p className="text-xl md:text-2xl text-[var(--color-neon-muted)] max-w-2xl mx-auto">
          The ultimate platform to merge data into templates, securely generate PDFs, and embed verifiable QR codes in milliseconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <Link href="/app" className="btn-primary group">
            Explore Vura
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="btn-secondary">
            View on GitHub
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto w-full mt-40 z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-[var(--color-neon-primary)]" />}
            title="Bulk Generation"
            description="Process thousands of rows from Excel into pristine PDFs in seconds."
          />
          <FeatureCard
            icon={<ShieldCheck className="w-8 h-8 text-[var(--color-neon-purple)]" />}
            title="Unique Verification IDs"
            description="Generate unforgeable CERT-XXXX identifiers for every document."
          />
          <FeatureCard
            icon={<Database className="w-8 h-8 text-[#007acc]" />}
            title="QR-based Validation"
            description="Embed direct verification links allowing instant public validation."
          />
          <FeatureCard
            icon={<Cloud className="w-8 h-8 text-[#e0aaff]" />}
            title="Secure Cloud Storage"
            description="Automatically store generated assets in AWS S3 with Neon Postgres metadata."
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-4xl mx-auto w-full mt-40 text-center z-10 relative">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">How It Works</h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-neon-border)] to-transparent hidden md:block -z-10"></div>

          <Step number="1" title="Upload Template" desc="Drop your blank PDF certificate design." />
          <Step number="2" title="Drop DataSet" desc="Upload Excel mapping names and details." />
          <Step number="3" title="Generate & Share" desc="Vura builds, stores, and gives you URLs." />
        </div>
      </section>

      {/* Verification Preview Section */}
      <section className="max-w-4xl mx-auto w-full mt-40 z-10 glass-card text-center p-12 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(157,78,221,0.05)] to-transparent pointer-events-none"></div>
        <h2 className="text-3xl mb-4 font-bold relative z-10">Try Verification Preview</h2>
        <p className="text-[var(--color-neon-muted)] mb-8 relative z-10">
          Scan the embedded QR code on a generated certificate to view its authenticity page instantly.
        </p>
        <Link href="/app" className="btn-secondary relative z-10">
          Try The App Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="w-full text-center mt-32 text-sm text-[var(--color-neon-muted)] relative z-10">
        &copy; {new Date().getFullYear()} Vura Inc. For a neon-inspired developer experience.
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-card flex flex-col items-start text-left">
      <div className="mb-4 bg-[var(--color-neon-bg)] p-3 rounded-xl border border-[var(--color-neon-border)]">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-[var(--color-neon-muted)] leading-relaxed">{description}</p>
    </div>
  )
}

function Step({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center bg-[var(--color-neon-surface)] p-6 rounded-2xl border border-[var(--color-neon-border)] flex-1 relative">
      <div className="w-12 h-12 rounded-full bg-[var(--color-neon-primary)] text-black flex items-center justify-center font-bold text-xl mb-4 shadow-[0_0_15px_rgba(0,229,153,0.3)]">
        {number}
      </div>
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <p className="text-sm text-[var(--color-neon-muted)]">{desc}</p>
    </div>
  )
}
