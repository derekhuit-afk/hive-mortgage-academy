import { Suspense } from 'react'
import LegalPage from './LegalPage'

export const metadata = {
  title: 'Terms of Service & Privacy Policy — Hive Mortgage Academy',
  description: 'Terms of Service and Privacy Policy for Hive Mortgage Academy.',
}

export const dynamic = 'force-dynamic'

export default function Terms() {
  return (
    <Suspense fallback={<div style={{ background:'#0A0A0B', minHeight:'100vh' }} />}>
      <LegalPage />
    </Suspense>
  )
}
