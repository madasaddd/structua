import type { Metadata } from 'next'
import './globals.css'
import { cn } from "@/lib/utils";
import { Suspense } from 'react'
import TopLoadingBar from '@/components/ui/TopLoadingBar'

export const metadata: Metadata = {
  title: 'Structua',
  description: 'Your AI companion for independent IELTS study. Master band 8-9 vocabulary in context and refine your grammar to crack the IELTS rubric.',
  icons: {
    icon: [
      { url: '/icons/icon-only.svg', media: '(prefers-color-scheme: light)' },
      { url: '/icons/icon-only-dark.svg', media: '(prefers-color-scheme: dark)' }
    ],
    apple: '/icons/Structua logo.png',
  },
  openGraph: {
    title: 'Structua - 40-Day Grammar Learning Platform',
    description: 'Your AI companion for independent IELTS study. Master band 8-9 vocabulary in context and refine your grammar to crack the IELTS rubric.',
    url: 'https://structua.com',
    siteName: 'Structua',
    images: [
      {
        url: '/icons/Structua logo.png',
        width: 1200,
        height: 630,
        alt: 'Structua - 40-Day Grammar Learning Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Structua - 40-Day Grammar Learning Platform',
    description: 'Your AI companion for independent IELTS study. Master band 8-9 vocabulary in context and refine your grammar to crack the IELTS rubric.',
    images: ['/icons/Structua logo.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="font-sans">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen bg-background text-primary" suppressHydrationWarning>
        <Suspense fallback={null}>
          <TopLoadingBar />
        </Suspense>
        {children}
      </body>
    </html>
  )
}
