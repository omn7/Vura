import Link from 'next/link'
import { ArrowLeft, Code, Database, Server, Shield, Layout } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[var(--color-neon-bg)] text-[var(--color-neon-text)] py-20 px-6 font-sans">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--color-neon-muted)] hover:text-white transition-colors w-fit bg-[var(--color-neon-surface)] border border-[var(--color-neon-border)] px-4 py-2 rounded-full">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="text-left mb-8">
                    <h1 className="text-5xl md:text-6xl font-black text-white font-display tracking-tight mb-4">About Vura</h1>
                    <p className="text-xl text-[var(--color-neon-muted)] max-w-2xl leading-relaxed">
                        An inside look at the architecture, tech stack, and engineering decisions behind the modern certificate generation platform.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Frontend */}
                    <div className="glass-card p-8 flex flex-col gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[rgba(157,78,221,0.1)] border border-[rgba(157,78,221,0.3)] flex items-center justify-center mb-2">
                            <Layout className="w-6 h-6 text-[#9d4edd]" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Frontend Architecture</h2>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li><strong className="text-white">Framework:</strong> Next.js 14 (App Router)</li>
                            <li><strong className="text-white">Styling:</strong> Tailwind CSS v4 with custom neon theme tokens and CSS variables.</li>
                            <li><strong className="text-white">Animations:</strong> Framer Motion for scroll reveals, floating elements, and staggered layout transitions.</li>
                            <li><strong className="text-white">Typography:</strong> Google Fonts (Outfit for body, Bricolage Grotesque for headings) optimized via Next/Font.</li>
                        </ul>
                    </div>

                    {/* Backend */}
                    <div className="glass-card p-8 flex flex-col gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[rgba(0,229,153,0.1)] border border-[rgba(0,229,153,0.3)] flex items-center justify-center mb-2">
                            <Server className="w-6 h-6 text-[var(--color-neon-primary)]" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Backend & Core Logic</h2>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li><strong className="text-white">Run Time:</strong> Node.js & Next.js API Routes (Serverless)</li>
                            <li><strong className="text-white">PDF Generation:</strong> `pdf-lib` for reading template geometries, embedding custom fonts, and writing text to exact coordinates based on user X/Y mapping.</li>
                            <li><strong className="text-white">Data Parsing:</strong> `xlsx` library to instantly read uploaded Excel sheets and map rows to certificate iterations.</li>
                        </ul>
                    </div>

                    {/* Database & Storage */}
                    <div className="glass-card p-8 flex flex-col gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[rgba(0,122,204,0.1)] border border-[rgba(0,122,204,0.3)] flex items-center justify-center mb-2">
                            <Database className="w-6 h-6 text-[#007acc]" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Database & Storage</h2>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li><strong className="text-white">Database:</strong> Neon Serverless Postgres. Chosen for its instant branching and edge-ready connection pooling.</li>
                            <li><strong className="text-white">ORM:</strong> Prisma. Ensures type-safe database queries and seamless schema migrations.</li>
                            <li><strong className="text-white">Cloud Storage:</strong> AWS S3. Every generated PDF is securely uploaded to an S3 bucket, returning a permanent public URL for the dashboard.</li>
                        </ul>
                    </div>

                    {/* Authentication */}
                    <div className="glass-card p-8 flex flex-col gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[rgba(255,189,46,0.1)] border border-[rgba(255,189,46,0.3)] flex items-center justify-center mb-2">
                            <Shield className="w-6 h-6 text-[#ffbd2e]" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Authentication & Security</h2>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li><strong className="text-white">Library:</strong> NextAuth.js (v4)</li>
                            <li><strong className="text-white">Providers:</strong> Dual support for Google OAuth and traditional Email/Password credentials.</li>
                            <li><strong className="text-white">Encryption:</strong> Passwords are hashed heavily using `bcryptjs` before reaching the database. Sessions are managed via secure, encrypted JWTs.</li>
                        </ul>
                    </div>
                </div>

                {/* Deep Dive Section */}
                <div className="glass-card p-10 mt-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse_at_top_right,rgba(0,229,153,0.1)_0%,transparent_70%)] pointer-events-none"></div>
                    <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                        <Code className="w-7 h-7 text-[var(--color-neon-primary)]" />
                        The Engineering Challenge
                    </h2>
                    <div className="prose prose-invert max-w-none text-gray-300 space-y-4">
                        <p>
                            The hardest part of building Vura was the <strong>coordinate mapping system</strong>. When a user uploads a blank PDF template, the browser doesn&apos;t inherently &quot;know&quot; where the lines are.
                        </p>
                        <p>
                            I had to build a custom interactive React visualizer using `react-pdf` that calculates exact X and Y percentage coordinates as the user drags markers across the screen.
                        </p>
                        <p>
                            When generation begins, the Node backend receives these percentage coordinates, inverts the Y-axis (because `pdf-lib` draws from bottom-to-top rather than top-to-bottom like the DOM), measures the exact width of every dynamic string using embedded font tools, and recalculates the anchors so names are perfectly center-aligned on the certificate regardless of their length.
                        </p>
                    </div>
                </div>

                <div className="text-center mt-12 mb-8">
                    <p className="text-[var(--color-neon-muted)] text-sm">
                        Built from the ground up by <a href="https://omnarkhede.tech" target="_blank" rel="noreferrer" className="text-white hover:text-[var(--color-neon-primary)] transition-colors inline-block font-medium">Om Narkhede</a>.
                    </p>
                </div>
            </div>
        </div>
    )
}
