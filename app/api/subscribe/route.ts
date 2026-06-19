import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email, source } = await req.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Config error' }, { status: 500 })
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/hma_leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal,resolution=ignore-duplicates',
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        source: source || 'homepage',
        created_at: new Date().toISOString(),
      }),
    })

    if (res.status === 404) {
      // Table doesn't exist yet — create it then retry
      await fetch(`${supabaseUrl}/rest/v1/rpc/create_hma_leads_if_missing`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    // Don't block the user if Supabase is down
    return NextResponse.json({ success: true })
  }
}
