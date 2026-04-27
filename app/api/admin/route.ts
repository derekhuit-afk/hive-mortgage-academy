import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const TOTAL_MODULES = 12;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.SETUP_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: students } = await supabaseAdmin.from("hma_students").select("id, name, email, nmls_number, recruiting_opt_in, state_licenses, created_at, last_nudged_at").order("created_at", { ascending: false });

  // Get module completion counts per student
  const { data: progress } = await supabaseAdmin.from("hma_module_progress").select("student_id, module_number").eq("completed", true);
  const completionMap: Record<string, number> = {};
  progress?.forEach(p => { completionMap[p.student_id] = (completionMap[p.student_id] || 0) + 1; });

  const enriched = (students || []).map(s => ({ ...s, completed_count: completionMap[s.id] || 0, total_modules: TOTAL_MODULES }));

  return NextResponse.json({ students: enriched, total: enriched.length });
}
