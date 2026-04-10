import type { Metadata } from 'next'
import './globals.css'
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: 'Structua',
  description: '40-day grammar learning platform',
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
        {children}
      </body>
    </html>
  )
}
