import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const { data } = await supabaseAdmin.from("hma_letters").select("*, hma_students(name, email, nmls_number)").eq("id", id).maybeSingle();
  if (!data) return NextResponse.json({ notFound: true }, { status: 404 });
  return NextResponse.json({ letter: data.data, lo: (data as any).hma_students });
}
