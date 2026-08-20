import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  let body: { email?: string; source?: string; nmls_id?: string; current_employer?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { email, source, nmls_id, current_employer } = body

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('[subscribe] Missing SUPABASE_URL or SUPABASE_SERVICE_KEY')
    return NextResponse.json(
      { error: 'We could not save your request right now. Please try again shortly.' },
      { status: 503 }
    )
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/hma_leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: 'return=minimal,resolution=merge-duplicates',
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        source: source || 'homepage',
        nmls_id: nmls_id || null,
        current_employer: current_employer || null,
      }),
    })

    if (!res.ok) {
      const detail = await res.text()
      console.error('[subscribe] Supabase insert failed', res.status, detail)
      return NextResponse.json(
        { error: 'We could not save your request right now. Please try again shortly.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[subscribe] Network error', err)
    return NextResponse.json(
      { error: 'We could not save your request right now. Please try again shortly.' },
      { status: 502 }
    )
  }
}
