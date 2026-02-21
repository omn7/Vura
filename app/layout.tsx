import type { Metadata } from 'next'
import { Outfit, Bricolage_Grotesque } from 'next/font/google'
import './globals.css'
import { ReactNode } from 'react'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
})

export const metadata: Metadata = {
  title: 'Vura - Bulk Certificate Generation Platform',
  description: 'Automate Certificate Generation at Scale. Create, distribute, and verify certificates with ease using Vura.',
  keywords: ['Certificate Generator', 'Bulk Certificates', 'Next.js', 'Automated PDF Generation', 'Online Certificates'],
  authors: [{ name: 'Om Narkhede', url: 'https://omnarkhede.tech' }],
  creator: 'Om Narkhede',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://vura.app',
    title: 'Vura - Bulk Certificate Generation Platform',
    description: 'Upload an Excel sheet, drop your PDF template, and Vura bulk-generates verifiable certificates in seconds.',
    siteName: 'Vura',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vura - Bulk Certificate Generation Platform',
    description: 'Automate Certificate Generation at Scale. Create, distribute, and verify certificates with ease.',
    creator: '@mr_codex',
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
      <body className={`${outfit.variable} ${bricolage.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          <div className="relative min-h-screen flex flex-col overflow-x-hidden">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
