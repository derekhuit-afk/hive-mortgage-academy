import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({}, { status: 400 });
  try {
    const { data } = await supabaseAdmin
      .from("hma_students")
      .select("id, name, nmls_number, email")
      .eq("id", id)
      .single();
    if (!data) return NextResponse.json({}, { status: 404 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}
