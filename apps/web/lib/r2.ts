import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Cloudflare R2 is S3-compatible. We talk to it through the AWS S3 SDK by pointing
 * the endpoint at the R2 account URL. Env:
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL
 */
const accountId = process.env.R2_ACCOUNT_ID;
const bucket = process.env.R2_BUCKET ?? "bangers";
const publicBase = process.env.R2_PUBLIC_URL ?? "";

export const isR2Configured = Boolean(
  accountId && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY
);

const client = new S3Client({
  region: "auto",
  endpoint: accountId
    ? `https://${accountId}.r2.cloudflarestorage.com`
    : "https://placeholder.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "placeholder",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "placeholder",
  },
});

export interface PresignResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

/**
 * Create a presigned PUT URL for a client-side upload, plus the public URL the
 * object will be served from once uploaded.
 */
export async function createPresignedUpload(
  filename: string,
  contentType: string,
  prefix = "products"
): Promise<PresignResult> {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${prefix}/${crypto.randomUUID()}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 600 });
  const publicUrl = publicBase
    ? `${publicBase.replace(/\/$/, "")}/${key}`
    : uploadUrl.split("?")[0];

  return { uploadUrl, publicUrl, key };
}
