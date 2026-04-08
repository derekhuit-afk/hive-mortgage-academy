import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await supabaseAdmin.from("hma_applications").insert({
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      nmls_number: body.nmls || null,
      market: body.market || null,
      production: body.production || null,
      experience: body.experience || null,
      why: body.why,
      status: "pending",
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
