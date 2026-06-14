import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { ReactNode } from 'react'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://vurakit.in'),
  title: 'Vura - Bulk Certificate Generation Platform',
  description: 'Automate Certificate Generation at Scale. Create, distribute, and verify certificates with ease with unique QR codes and API access.',
  keywords: ['Certificate Generator', 'Bulk Certificates', 'Next.js', 'API Integration', 'Automated PDF Generation', 'Secure Verification'],
  authors: [{ name: 'Vura Team' }],
  creator: 'Vura Team',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://vurakit.in',
    title: 'Vura | Automate Certificate Generation at Scale',
    description: 'Bulk-generate verifiable certificates in seconds via Excel or API. Secure, QR-powered, and high-performance.',
    siteName: 'Vura',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vura - Bulk Certificate Generation Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vura | Automate Certificate Generation at Scale',
    description: 'Bulk-generate verifiable certificates in seconds via Excel or API. Secure, QR-powered verification included.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/vuralogo.png',
    apple: '/vuralogo.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

import { Providers } from "@/components/Providers"

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          <div className="relative min-h-screen flex flex-col overflow-x-hidden">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
