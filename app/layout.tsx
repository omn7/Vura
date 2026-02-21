import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ReactNode } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vura - Bulk Certificate Generation Platform',
  description: 'Automate Certificate Generation at Scale. Create, distribute, and verify certificates with ease.',
}

import { Providers } from "@/components/Providers"

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="relative min-h-screen flex flex-col overflow-x-hidden">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
