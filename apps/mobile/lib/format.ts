export function money(value: string | number): string {
  const n = typeof value === "string" ? Number(value) : value;
  return `$${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
}
