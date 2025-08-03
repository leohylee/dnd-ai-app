import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Header } from '@/components/navigation/header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'D&D AI App',
  description: 'AI-powered single-player D&D 5e web application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <Header />
          <main>{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
