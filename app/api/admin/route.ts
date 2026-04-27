import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const TOTAL_MODULES = 12;

/**
 * GET /api/admin?secret=...
 *
 * Returns roster of HMA students with completion counts. Uses a two-pass
 * select: tries the full column set first, falls back to baseline columns
 * if recruiting_opt_in / state_licenses don't exist yet (pre-migration state).
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const FULL_COLS = "id, name, email, nmls_number, recruiting_opt_in, state_licenses, created_at, last_nudged_at";
  const BASE_COLS = "id, name, email, nmls_number, created_at, last_nudged_at";

  let students: Record<string, unknown>[] | null = null;
  let schemaWarning: string | null = null;

  // First try with the full schema — works post-migration
  let { data, error } = await supabaseAdmin
    .from("hma_students")
    .select(FULL_COLS)
    .order("created_at", { ascending: false });

  if (error) {
    const code = (error as { code?: string }).code;
    const msg = String((error as { message?: string }).message || "");
    if (code === "42703" || /column .* does not exist/i.test(msg)) {
      // Pre-migration: retry with baseline columns
      schemaWarning = "Migration not yet applied — recruiting_opt_in and state_licenses columns missing. Run /api/setup once SUPABASE_DB_URL has the real Postgres password.";
      const retry = await supabaseAdmin
        .from("hma_students")
        .select(BASE_COLS)
        .order("created_at", { ascending: false });
      students = retry.data;
    } else {
      console.error("Admin students fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch students.", details: msg }, { status: 500 });
    }
  } else {
    students = data;
  }

  // Module completion counts per student
  const { data: progress } = await supabaseAdmin
    .from("hma_module_progress")
    .select("student_id, module_number")
    .eq("completed", true);
  const completionMap: Record<string, number> = {};
  progress?.forEach((p: { student_id: string }) => {
    completionMap[p.student_id] = (completionMap[p.student_id] || 0) + 1;
  });

  const enriched = (students || []).map(s => ({
    ...s,
    completed_count: completionMap[s.id as string] || 0,
    total_modules: TOTAL_MODULES,
  }));

  return NextResponse.json({
    students: enriched,
    total: enriched.length,
    ...(schemaWarning ? { _schema_warning: schemaWarning } : {}),
  });
}
