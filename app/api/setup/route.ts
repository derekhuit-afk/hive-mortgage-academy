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
  billing_cycle text NOT NULL DEFAULT 'monthly',
  password_hash text NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
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

ALTER TABLE hma_students ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE hma_students ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
CREATE INDEX IF NOT EXISTS hma_students_email_idx ON hma_students(email);
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

  const poolerUrl = process.env.SUPABASE_DB_URL || "";
  const directUrl = buildDirectUrl(poolerUrl);

  // Try direct connection first, then pooler
  const urls = [directUrl, poolerUrl];
  let lastError = "";

  for (const connUrl of urls) {
    const pool = new Pool({
      connectionString: connUrl,
      ssl: { rejectUnauthorized: false },
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
