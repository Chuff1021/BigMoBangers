import { NextResponse } from "next/server";
import { getCustomers } from "@bangers/db";
import { getTenantFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const tenant = await getTenantFromRequest();
  const customers = await getCustomers(tenant.id);
  return NextResponse.json(customers);
}
