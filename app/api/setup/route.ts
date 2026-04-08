import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";
export const maxDuration = 30;

const SQL = `
CREATE TABLE IF NOT EXISTS hma_students (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  nmls_number text NOT NULL,
  plan text NOT NULL DEFAULT 'foundation',
  billing_cycle text NOT NULL DEFAULT 'monthly',
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hma_module_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES hma_students(id) ON DELETE CASCADE,
  module_number int NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  UNIQUE(student_id, module_number)
);

CREATE TABLE IF NOT EXISTS hma_quiz_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES hma_students(id) ON DELETE CASCADE,
  module_number int NOT NULL,
  score int NOT NULL DEFAULT 0,
  answers jsonb,
  passed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hma_certificates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES hma_students(id) ON DELETE CASCADE,
  student_email text,
  student_name text,
  nmls_number text,
  issued_at timestamptz DEFAULT now(),
  certificate_number text UNIQUE NOT NULL
);
`;

export async function GET(req: NextRequest) {
  // Simple auth check — only run if secret matches
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    await client.query(SQL);

    const result = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'hma_%' ORDER BY table_name"
    );
    const tables = result.rows.map((r: { table_name: string }) => r.table_name);
    client.release();
    await pool.end();

    return NextResponse.json({ ok: true, tables, message: "Migration complete." });
  } catch (err: any) {
    await pool.end().catch(() => {});
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
