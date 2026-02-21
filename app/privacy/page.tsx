import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[var(--color-neon-bg)] text-[var(--color-neon-text)] py-20 px-6 font-sans">
            <div className="max-w-3xl mx-auto glass-card flex flex-col gap-6">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--color-neon-muted)] hover:text-white transition-colors mb-4 w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <h1 className="text-4xl font-bold text-white font-display mb-2">Privacy Policy</h1>
                <p className="text-sm text-[var(--color-neon-muted)] border-b border-[var(--color-neon-border)] pb-6 mb-2">Last Updated: October 2023</p>

                <div className="prose prose-invert max-w-none text-gray-300 space-y-6">
                    <p>Welcome to Vura. This Privacy Policy describes how we collect, use, and handle your personal information when you use our website, products, and services.</p>

                    <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>
                    <p>When you register for an account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number. We also securely process files you upload (like PDF templates and Excel spreadsheets) exclusively for the purpose of generating your certificates.</p>

                    <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. How We Use Your Information</h2>
                    <p>We use the information we collect in various ways, including to:</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li>Provide, operate, and maintain our website</li>
                        <li>Improve, personalize, and expand our website</li>
                        <li>Understand and analyze how you use our website</li>
                        <li>Develop new products, services, features, and functionality</li>
                        <li>Communicate with you for customer service or updates</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Data Security and Storage</h2>
                    <p>Your PDFs and certificate assets are securely uploaded and stored in AWS S3 buckets. We use standard encryption and security protocols to protect your account metadata stored in our Neon Postgres databases. We do not sell your data to third parties.</p>

                    <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us at hello@vura.app.</p>
                </div>
            </div>
        </div>
    )
}
