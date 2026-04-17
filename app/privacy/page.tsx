import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const metadata = { title: 'Privacy Policy — Hive Mortgage Academy' }
export default function PrivacyRedirect() { redirect('/terms?tab=privacy') }
