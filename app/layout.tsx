import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: 'Hive Mortgage Academy | Professional Mortgage Training',
  description: 'College-level mortgage training from 100 to 400 level. 25 modules, four tiers, built for mortgage professionals.',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
