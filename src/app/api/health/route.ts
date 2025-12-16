import { NextResponse } from "next/server";
import { checkConnection } from "@/lib/pg";

export async function GET() {
  const ok = await checkConnection();
  if (ok) return NextResponse.json({ status: "ok" });
  return NextResponse.json({ status: "down" }, { status: 503 });
}
