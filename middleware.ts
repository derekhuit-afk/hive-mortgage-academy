import { NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// TAKEDOWN 2026-08-20
// Every route — pages and API — returns HTTP 503 with a maintenance notice.
// Full pre-takedown state preserved on branch: pre-takedown-backup-2026-08-20
// To restore: revert this file to a passthrough matcher and redeploy.
// ─────────────────────────────────────────────────────────────────────────────

const PAGE = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive">
<title>Hive Mortgage Academy — Temporarily Unavailable</title>
<style>
  :root{color-scheme:dark}
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:#0f172a;color:#e2e8f0;padding:24px;
    font-family:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    line-height:1.6;-webkit-text-size-adjust:100%}
  .card{max-width:520px;width:100%;text-align:center}
  .mark{width:48px;height:48px;margin:0 auto 28px;border-radius:12px;background:#fbbf24;
    color:#0f172a;font-weight:900;font-size:22px;display:flex;align-items:center;justify-content:center}
  h1{font-size:24px;font-weight:800;margin:0 0 16px;letter-spacing:-.01em}
  p{color:#94a3b8;font-size:15px;margin:0 0 16px}
  .rule{height:1px;background:#1e293b;margin:32px 0 20px}
  .fine{color:#64748b;font-size:12px;margin:0}
</style></head>
<body><div class="card">
  <div class="mark">H</div>
  <h1>Temporarily unavailable</h1>
  <p>Hive Mortgage Academy is offline while its content and disclosures are under review.</p>
  <p>There is nothing you need to do. This page is not a solicitation, an offer to lend, or an offer of employment.</p>
  <div class="rule"></div>
  <p class="fine">Huitai LLC &middot; Not affiliated with or endorsed by any lender, employer, or regulatory body.</p>
</div></body></html>`

export function middleware() {
  return new NextResponse(PAGE, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Retry-After': '86400',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  })
}

// Match everything except Next internals and the crawler directives file.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt).*)'],
}
