export const metadata = { title: 'Unavailable', robots: 'noindex,nofollow' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>)
}
