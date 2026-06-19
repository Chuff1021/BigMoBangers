import fs from "node:fs";

const csvPath = process.argv[2];
const baseUrl = process.argv[3] ?? "https://big-mo-bangers.vercel.app";
if (!csvPath) {
  console.error("Usage: node scripts/import-pos-only-api.mjs <csv> [baseUrl]");
  process.exit(1);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    if (row.some((v) => v.trim() !== "")) rows.push(row);
  }
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) =>
    Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? "").trim()]))
  );
}

function money(value) {
  const n = Number(String(value).replace(/[$,]/g, ""));
  return Number.isFinite(n) && String(value).trim() !== "" ? n.toFixed(2) : "0.00";
}

function intValue(value) {
  const n = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
}

function authHeader() {
  const raw = fs.readFileSync(".admin-login.txt", "utf8");
  const password = raw.match(/^Password:\s*(.+)$/m)?.[1]?.trim();
  if (!password) throw new Error("Could not read admin password from .admin-login.txt");
  return `Basic ${Buffer.from(`staff:${password}`).toString("base64")}`;
}

async function jsonFetch(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text.slice(0, 500) };
  }
  return { res, data };
}

const auth = authHeader();
const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
const summary = { created: 0, updated: 0, skippedActiveCollision: 0, failed: 0 };
const details = [];

for (const row of rows) {
  const aliases = row.aliases
    .split(/[|;]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const scanCodes = [row.barcode, row.sku, ...aliases].filter(Boolean);
  let existing = null;

  for (const code of scanCodes) {
    const { res, data } = await jsonFetch(
      `${baseUrl}/api/products/scan?tenant=bigmos&code=${encodeURIComponent(code)}`
    );
    if (res.ok && data?.id) {
      existing = data;
      break;
    }
  }

  const tags = [
    "pos-only",
    "bmfw1",
    "source:BMFW1",
    row.sku ? `sku:${row.sku}` : null,
    row.barcode ? `barcode:${row.barcode}` : null,
    ...aliases.flatMap((code) => [code, `barcode:${code}`, `sku:${code}`]),
  ].filter(Boolean);

  const payload = {
    name: row.name,
    sku: row.sku || undefined,
    barcode: row.barcode || undefined,
    price: money(row.price),
    inventoryQty: intValue(row.qty),
    lowStockThreshold: 0,
    trackInventory: true,
    isFeatured: false,
    isActive: false,
    description: row.description || undefined,
    tags,
  };

  try {
    if (existing) {
      const existingTags = Array.isArray(existing.tags) ? existing.tags : [];
      if (existing.isActive && !existingTags.includes("bmfw1")) {
        summary.skippedActiveCollision++;
        details.push({ action: "skipped-active-collision", name: row.name, existing: existing.name });
        continue;
      }
      const { res, data } = await jsonFetch(`${baseUrl}/api/products/${existing.id}`, {
        method: "PUT",
        headers: { Authorization: auth, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`PUT ${res.status}: ${JSON.stringify(data)}`);
      summary.updated++;
      details.push({ action: "updated", name: row.name, id: data.id });
    } else {
      const { res, data } = await jsonFetch(`${baseUrl}/api/products`, {
        method: "POST",
        headers: { Authorization: auth, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`POST ${res.status}: ${JSON.stringify(data)}`);
      summary.created++;
      details.push({ action: "created", name: row.name, id: data.id });
    }
  } catch (error) {
    summary.failed++;
    details.push({ action: "failed", name: row.name, error: error.message });
  }
}

console.log(JSON.stringify({ summary, details }, null, 2));
if (summary.failed > 0) process.exit(1);
