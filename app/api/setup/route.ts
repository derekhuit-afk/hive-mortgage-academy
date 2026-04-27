import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";
export const maxDuration = 60;

const SQL = `
CREATE TABLE IF NOT EXISTS hma_students (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  nmls_number text DEFAULT '',
  plan text NOT NULL DEFAULT 'free',
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE hma_students DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS hma_module_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES hma_students(id) ON DELETE CASCADE,
  module_number int NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  score int DEFAULT 0,
  UNIQUE(student_id, module_number)
);
ALTER TABLE hma_module_progress DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS hma_quiz_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES hma_students(id) ON DELETE CASCADE,
  module_number int NOT NULL,
  score int NOT NULL DEFAULT 0,
  answers jsonb,
  passed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE hma_quiz_attempts DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS hma_certificates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES hma_students(id) ON DELETE CASCADE,
  student_email text,
  student_name text,
  nmls_number text,
  issued_at timestamptz DEFAULT now(),
  certificate_number text UNIQUE NOT NULL
);
ALTER TABLE hma_certificates DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS hma_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  nmls_number text,
  market text,
  production text,
  experience text,
  why text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE hma_applications DISABLE ROW LEVEL SECURITY;

ALTER TABLE hma_students ADD COLUMN IF NOT EXISTS recruiting_opt_in boolean DEFAULT false;
ALTER TABLE hma_students ADD COLUMN IF NOT EXISTS state_licenses text[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS hma_students_email_idx ON hma_students(email);
CREATE INDEX IF NOT EXISTS hma_students_recruiting_idx ON hma_students(recruiting_opt_in) WHERE recruiting_opt_in = true;

CREATE TABLE IF NOT EXISTS hma_consent_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  name text,
  product text NOT NULL DEFAULT 'hive-mortgage-academy',
  tier text,
  billing text,
  terms_version text,
  privacy_version text,
  agreed_at timestamptz NOT NULL,
  ip_address inet,
  user_agent text,
  recruiting_opt_in boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hma_consent_log_email_idx ON hma_consent_log(email);
CREATE INDEX IF NOT EXISTS hma_consent_log_agreed_at_idx ON hma_consent_log(agreed_at DESC);
ALTER TABLE hma_consent_log ADD COLUMN IF NOT EXISTS recruiting_opt_in boolean DEFAULT false;
ALTER TABLE hma_consent_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all" ON hma_consent_log;
CREATE POLICY "service_role_all" ON hma_consent_log FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Careers inquiries (public contact form on /careers) ───────────────────
CREATE TABLE IF NOT EXISTS hma_careers_inquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  nmls text,
  states_licensed text,
  years_experience text,
  message text,
  source text DEFAULT '/careers',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hma_careers_inquiries_email_idx ON hma_careers_inquiries(email);
CREATE INDEX IF NOT EXISTS hma_careers_inquiries_created_idx ON hma_careers_inquiries(created_at DESC);
ALTER TABLE hma_careers_inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all" ON hma_careers_inquiries;
CREATE POLICY "service_role_all" ON hma_careers_inquiries FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Drop legacy billing/letter tables — no longer used in free model ───────
DROP TABLE IF EXISTS hma_letters CASCADE;
DROP TABLE IF EXISTS hma_renewal_reminders CASCADE;
DROP TABLE IF EXISTS hma_cancellation_log CASCADE;
ALTER TABLE hma_students DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE hma_students DROP COLUMN IF EXISTS stripe_subscription_id;
ALTER TABLE hma_students DROP COLUMN IF EXISTS current_period_end;
ALTER TABLE hma_students DROP COLUMN IF EXISTS billing_cycle;
DROP INDEX IF EXISTS hma_students_period_end_idx;
`;

function buildDirectUrl(poolerUrl: string): string {
  // Convert pooler URL to direct connection URL
  // pooler: postgresql://postgres.REF:PASS@aws-*.pooler.supabase.com:6543/postgres
  // direct: postgresql://postgres:PASS@db.REF.supabase.co:5432/postgres
  try {
    const match = poolerUrl.match(/postgres\.([^:]+):([^@]+)@/);
    if (match) {
      const ref = match[1];
      const pass = match[2];
      return `postgresql://postgres:${pass}@db.${ref}.supabase.co:5432/postgres`;
    }
  } catch {}
  return poolerUrl;
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const poolerUrlRaw = process.env.SUPABASE_DB_URL || "";
  // Strip any ?sslmode=... from the URL so we can control SSL via pg Pool options only.
  // Supabase pooler uses a self-signed cert chain; pg's default tls settings reject it.
  const poolerUrl = poolerUrlRaw.replace(/[?&]sslmode=[^&]*/g, "").replace(/\?&/, "?").replace(/\?$/, "");
  const directUrl = buildDirectUrl(poolerUrl);

  // Try direct connection first, then pooler
  const urls = [directUrl, poolerUrl];
  let lastError = "";

  for (const connUrl of urls) {
    const pool = new Pool({
      connectionString: connUrl,
      // require=true + rejectUnauthorized=false accepts Supabase's self-signed chain
      ssl: { require: true, rejectUnauthorized: false } as any,
      connectionTimeoutMillis: 15000,
      idleTimeoutMillis: 10000,
      max: 1,
    });

    try {
      const client = await pool.connect();
      await client.query(SQL);

      const result = await client.query(
        "SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'hma_%' ORDER BY table_name"
      );
      const tables = result.rows.map((r: any) => r.table_name);
      client.release();
      await pool.end();

      return NextResponse.json({
        ok: true,
        tables,
        message: `Migration complete via ${connUrl.includes("db.") ? "direct" : "pooler"} connection.`,
        connected: connUrl.slice(0, 40) + "...",
      });
    } catch (err: any) {
      lastError = err.message;
      await pool.end().catch(() => {});
    }
  }

  return NextResponse.json({ error: lastError, tried: urls.map(u => u.slice(0,40)) }, { status: 500 });
}
