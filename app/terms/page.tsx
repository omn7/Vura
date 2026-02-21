import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[var(--color-neon-bg)] text-[var(--color-neon-text)] py-20 px-6 font-sans">
            <div className="max-w-3xl mx-auto glass-card flex flex-col gap-6">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--color-neon-muted)] hover:text-white transition-colors mb-4 w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <h1 className="text-4xl font-bold text-white font-display mb-2">Terms of Service</h1>
                <p className="text-sm text-[var(--color-neon-muted)] border-b border-[var(--color-neon-border)] pb-6 mb-2">Last Updated: October 2023</p>

                <div className="prose prose-invert max-w-none text-gray-300 space-y-6">
                    <p>By accessing and using Vura, you agree to comply with these Terms of Service. If you do not agree with these terms, please do not use our platform.</p>

                    <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Use of Service</h2>
                    <p>Vura provides a tool for generating PDF certificates from spreadsheet data. You agree to use the service only for lawful purposes. You are solely responsible for the content, templates, and data (including personal names and emails) that you upload to our platform.</p>

                    <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. User Accounts</h2>
                    <p>To use our core features, you must register for an account using Google OAuth or a valid email address. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>

                    <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Intellectual Property</h2>
                    <p>The visual interfaces, graphics, design, compilation, information, data, computer code, and all other elements of the service provided by Vura are protected by intellectual property rights. You retain ownership of the PDF templates and data you upload.</p>

                    <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Limitation of Liability</h2>
                    <p>In no event shall Vura, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

                    <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Modifications to Terms</h2>
                    <p>We reserve the right to modify or replace these Terms at any time. We will provide notice of significant changes on our website prior to the changes taking effect.</p>
                </div>
            </div>
        </div>
    )
}
