import { NextResponse } from "next/server";
import { listCustomers } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const customers = await listCustomers();
  return NextResponse.json(customers);
}
