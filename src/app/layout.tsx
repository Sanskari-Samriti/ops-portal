import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sanskari Samriti — Admin',
  description: 'Admin portal for Sanskari Samriti devotional app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
