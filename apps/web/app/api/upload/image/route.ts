import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTenantFromRequest } from "@/lib/auth";
import { createPresignedUpload, isR2Configured } from "@/lib/r2";

export const runtime = "nodejs";

const BodySchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const tenant = await getTenantFromRequest();
  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (!isR2Configured) {
    return NextResponse.json(
      { error: "Image storage (R2) is not configured", configured: false },
      { status: 503 }
    );
  }

  const result = await createPresignedUpload(
    parsed.data.filename,
    parsed.data.contentType,
    `products/${tenant.slug}`
  );

  return NextResponse.json(result);
}
