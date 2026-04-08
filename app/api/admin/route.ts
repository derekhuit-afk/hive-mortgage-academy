import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const TIER_LIMITS: Record<string,number> = { free:6, foundation:9, accelerator:11, elite:12 };

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.SETUP_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: students } = await supabaseAdmin.from("hma_students").select("id, name, email, nmls_number, plan, billing_cycle, created_at, last_nudged_at").order("created_at", { ascending: false });

  // Get module completion counts per student
  const { data: progress } = await supabaseAdmin.from("hma_module_progress").select("student_id, module_number").eq("completed", true);
  const completionMap: Record<string, number> = {};
  progress?.forEach(p => { completionMap[p.student_id] = (completionMap[p.student_id] || 0) + 1; });

  const enriched = (students || []).map(s => ({ ...s, completed_count: completionMap[s.id] || 0, tier_limit: TIER_LIMITS[s.plan] || 6 }));

  return NextResponse.json({ students: enriched, total: enriched.length });
}
