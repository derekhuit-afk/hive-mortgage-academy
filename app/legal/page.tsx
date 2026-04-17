import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const metadata = { title: 'Legal — Hive Mortgage Academy' }
export default function LegalRedirect() { redirect('/terms') }
