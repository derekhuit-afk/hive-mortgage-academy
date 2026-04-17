import { redirect } from 'next/navigation'
export const metadata = { title: 'Privacy Policy — Hive Mortgage Academy' }
export default function PrivacyRedirect() { redirect('/terms?tab=privacy') }
