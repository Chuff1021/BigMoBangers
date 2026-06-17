import type { CreateOrderInput } from "@bangers/types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
const TENANT = process.env.EXPO_PUBLIC_TENANT_SLUG ?? "bigmos";

export interface ApiCategory {
  id: string;
  name: string;
  emoji: string | null;
  sortOrder: number;
}

export interface ApiProduct {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  images: string[];
  youtubeUrl: string | null;
  streamVideoId: string | null;
  inventoryQty: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  isFeatured: boolean;
  isActive: boolean;
  tags: string[];
  categoryId: string | null;
  category: ApiCategory | null;
}

export interface ApiOrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
}

export interface ApiOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string | null;
  status: string;
  paymentStatus: string;
  subtotal: string;
  tax: string;
  total: string;
  pickupNote: string | null;
  createdAt: string;
  items: ApiOrderItem[];
}

export interface CloverCheckoutResponse {
  orderId: string;
  orderNumber: string;
  amount: number;
  /** Hosted Clover pay-page URL (null in demo). */
  href: string | null;
  cloverConfigured: boolean;
  demo: boolean;
}

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  featured?: boolean;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let detail = "";
    try {
      detail = JSON.stringify(await res.json());
    } catch {
      /* ignore */
    }
    throw new Error(`API ${res.status} ${path} ${detail}`);
  }
  return res.json() as Promise<T>;
}

function withTenant(path: string, params: Record<string, string | undefined> = {}) {
  const sp = new URLSearchParams({ tenant: TENANT });
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, v);
  }
  return `${path}?${sp.toString()}`;
}

export function fetchProducts(filters: ProductFilters = {}): Promise<ApiProduct[]> {
  return request<ApiProduct[]>(
    withTenant("/api/products", {
      categoryId: filters.categoryId,
      search: filters.search,
      featured: filters.featured === undefined ? undefined : String(filters.featured),
    })
  );
}

export function fetchProductById(id: string): Promise<ApiProduct> {
  return request<ApiProduct>(withTenant(`/api/products/${id}`));
}

export function fetchCategories(): Promise<ApiCategory[]> {
  return request<ApiCategory[]>(withTenant("/api/categories"));
}

export function createOrder(
  data: CreateOrderInput,
  authToken?: string
): Promise<ApiOrder> {
  return request<ApiOrder>(withTenant("/api/orders"), {
    method: "POST",
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    body: JSON.stringify(data),
  });
}

export function fetchOrders(authToken: string): Promise<ApiOrder[]> {
  return request<ApiOrder[]>("/api/orders", {
    headers: { Authorization: `Bearer ${authToken}` },
  });
}

export function fetchOrdersByPhone(phone: string): Promise<ApiOrder[]> {
  return request<ApiOrder[]>(withTenant("/api/orders/lookup", { phone }));
}

export function createCloverCheckout(
  data: CreateOrderInput
): Promise<CloverCheckoutResponse> {
  return request<CloverCheckoutResponse>(
    withTenant("/api/clover/create-checkout"),
    { method: "POST", body: JSON.stringify({ ...data, tenantSlug: TENANT }) }
  );
}

/** Staff: resolve a scanned barcode/SKU to a product (null if not found). */
export async function fetchProductByCode(code: string): Promise<ApiProduct | null> {
  try {
    return await request<ApiProduct>(withTenant("/api/products/scan", { code }));
  } catch {
    return null;
  }
}

export interface PosSaleItem {
  productId: string;
  quantity: number;
}
export interface PosSaleResponse {
  id: string;
  orderNumber: string;
  total: string;
  method: string;
  href: string | null;
}

/** Staff: complete an in-person register sale. */
export function posSale(
  items: PosSaleItem[],
  opts: { method: "cash" | "card"; customerName?: string; customerPhone?: string } = { method: "card" }
): Promise<PosSaleResponse> {
  return request<PosSaleResponse>(withTenant("/api/pos/sale"), {
    method: "POST",
    body: JSON.stringify({ ...opts, items }),
  });
}
