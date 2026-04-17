import { redirect } from 'next/navigation'
export const metadata = { title: 'Legal — Hive Mortgage Academy' }
export default function LegalRedirect() { redirect('/terms') }
