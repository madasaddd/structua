import type { Metadata } from 'next'
import { DM_Sans, Geist } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-geist-sans'});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

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
    <html lang="en" className={cn("font-sans", dmSans.variable, geist.variable)}>
      <body className="antialiased min-h-screen bg-background text-primary" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
