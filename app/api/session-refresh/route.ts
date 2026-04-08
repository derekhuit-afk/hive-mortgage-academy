import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.headers.get("x-session-token") || req.nextUrl.searchParams.get("token");
  const student = await validateSession(token);
  if (!student) return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  return NextResponse.json({ student });
}
