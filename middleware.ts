import { NextResponse } from 'next/server'

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive,nosnippet">
<title>Site temporarily unavailable</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:#0a0a0a;color:#e5e5e5;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px;line-height:1.6}
  .wrap{max-width:560px;text-align:center}
  h1{font-size:1.5rem;margin:0 0 16px;font-weight:600;color:#fafafa}
  p{margin:0 0 12px;color:#a3a3a3;font-size:0.95rem}
  hr{border:0;border-top:1px solid #262626;margin:28px 0}
  .small{font-size:0.78rem;color:#737373;margin:4px 0}
  a{color:#a3a3a3;text-decoration:underline}
</style>
</head>
<body>
<main class="wrap">
  <h1>This site is temporarily unavailable</h1>
  <p>Hive Mortgage Academy is currently offline pending review and is not accepting inquiries through this website.</p>
  <p>If you are already working with Derek Huit, please continue to communicate with him directly using the contact information from your prior correspondence.</p>
  <hr>
  <p class="small">Derek Huit &middot; Loan Officer &middot; NMLS&nbsp;#203980</p>
  <p class="small">Cardinal Financial Company, Limited Partnership &middot; Company NMLS&nbsp;#66247</p>
  <p class="small">Equal Housing Lender</p>
  <p class="small"><a href="https://www.nmlsconsumeraccess.org/EntityDetails.aspx/INDIVIDUAL/203980" rel="noindex,nofollow">Verify NMLS&nbsp;#203980</a></p>
</main>
</body>
</html>`

export function middleware() {
  return new NextResponse(HTML, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
      'Cache-Control': 'no-store, max-age=0, must-revalidate',
      'Retry-After': '604800',
    },
  })
}
