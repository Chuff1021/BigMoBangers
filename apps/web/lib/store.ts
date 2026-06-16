import { IS_DEMO, TENANT_SLUG } from "./mode";
import {
  DEMO_TENANT,
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
  DEMO_ORDERS,
  demoCustomers,
  type DemoProduct,
  type DemoOrder,
  type DemoCategory,
  type DemoCustomer,
} from "./demo";

/**
 * Data facade used by every storefront + dashboard page and API route.
 * In demo mode it serves the in-memory dataset; otherwise it dynamically imports
 * @bangers/db (kept out of the module graph in demo so neon() never runs).
 */

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  isFeatured?: boolean;
  includeInactive?: boolean;
}

async function db() {
  return import("@bangers/db");
}

export async function getTenant() {
  if (IS_DEMO) return DEMO_TENANT;
  const { getTenantBySlug } = await db();
  const t = await getTenantBySlug(TENANT_SLUG);
  return (t ?? DEMO_TENANT) as typeof DEMO_TENANT;
}

export async function listCategories(): Promise<DemoCategory[]> {
  if (IS_DEMO) return DEMO_CATEGORIES;
  const { getCategories } = await db();
  const t = await getTenant();
  return (await getCategories(t.id)) as unknown as DemoCategory[];
}

export async function listProducts(
  filters: ProductFilters = {}
): Promise<DemoProduct[]> {
  if (IS_DEMO) {
    let list = DEMO_PRODUCTS.slice();
    if (!filters.includeInactive) list = list.filter((p) => p.isActive);
    if (filters.categoryId) list = list.filter((p) => p.categoryId === filters.categoryId);
    if (typeof filters.isFeatured === "boolean")
      list = list.filter((p) => p.isFeatured === filters.isFeatured);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
  }
  const { getProducts } = await db();
  const t = await getTenant();
  return (await getProducts(t.id, filters)) as unknown as DemoProduct[];
}

export async function getProduct(id: string): Promise<DemoProduct | null> {
  if (IS_DEMO) return DEMO_PRODUCTS.find((p) => p.id === id) ?? null;
  const { getProductById } = await db();
  const t = await getTenant();
  return (await getProductById(t.id, id)) as unknown as DemoProduct | null;
}

export async function listOrders(filters: { status?: string } = {}): Promise<DemoOrder[]> {
  if (IS_DEMO) {
    let list = DEMO_ORDERS.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (filters.status) list = list.filter((o) => o.status === filters.status);
    return list;
  }
  const { getOrders } = await db();
  const t = await getTenant();
  return (await getOrders(t.id, filters)) as unknown as DemoOrder[];
}

export async function getOrder(id: string): Promise<DemoOrder | null> {
  if (IS_DEMO) return DEMO_ORDERS.find((o) => o.id === id) ?? null;
  const { getOrderById } = await db();
  const t = await getTenant();
  return (await getOrderById(t.id, id)) as unknown as DemoOrder | null;
}

export async function ordersByPhone(phone: string): Promise<DemoOrder[]> {
  if (IS_DEMO) return DEMO_ORDERS.filter((o) => o.customerPhone === phone);
  const { getOrdersByPhone } = await db();
  const t = await getTenant();
  return (await getOrdersByPhone(t.id, phone)) as unknown as DemoOrder[];
}

export async function listCustomers(): Promise<DemoCustomer[]> {
  if (IS_DEMO) return demoCustomers();
  const { getCustomers } = await db();
  const t = await getTenant();
  return (await getCustomers(t.id)) as unknown as DemoCustomer[];
}

export async function getCustomer(id: string) {
  if (IS_DEMO) {
    const c = demoCustomers().find((x) => x.id === id);
    if (!c) return null;
    const orders = DEMO_ORDERS.filter((o) => o.customerPhone === c.phone);
    return { ...c, orders };
  }
  const { getCustomerById } = await db();
  const t = await getTenant();
  return getCustomerById(t.id, id);
}

// ---- Mutations -----------------------------------------------------------

export async function createProductM(data: Record<string, unknown>) {
  if (IS_DEMO) {
    return { id: `demo-${DEMO_PRODUCTS.length + 1}`, ...data };
  }
  const { createProduct } = await db();
  const t = await getTenant();
  return createProduct(t.id, data as never);
}

export async function updateProductM(id: string, data: Record<string, unknown>) {
  if (IS_DEMO) return { id, ...data };
  const { updateProduct } = await db();
  const t = await getTenant();
  return updateProduct(t.id, id, data as never);
}

export async function deleteProductM(id: string) {
  if (IS_DEMO) return { id };
  const { deleteProduct } = await db();
  const t = await getTenant();
  return deleteProduct(t.id, id);
}

export async function adjustInventoryM(
  productId: string,
  qtyChange: number,
  reason: string,
  note?: string
) {
  if (IS_DEMO) {
    const p = DEMO_PRODUCTS.find((x) => x.id === productId);
    return p ? { ...p, inventoryQty: p.inventoryQty + qtyChange } : null;
  }
  const { adjustInventory } = await db();
  const t = await getTenant();
  return adjustInventory(t.id, productId, qtyChange, reason as never, undefined, note);
}

export async function updateOrderStatusM(id: string, status: string) {
  if (IS_DEMO) {
    const o = DEMO_ORDERS.find((x) => x.id === id);
    if (o) o.status = status;
    return o ?? null;
  }
  const { updateOrderStatus } = await db();
  const t = await getTenant();
  return updateOrderStatus(t.id, id, status as never);
}

export interface CreateOrderArgs {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  pickupNote?: string;
  items: { productId: string; quantity: number }[];
  status?: string;
  paymentStatus?: string;
}

export async function createOrderM(data: CreateOrderArgs) {
  if (IS_DEMO) {
    let subtotal = 0;
    const items = data.items.map((it, idx) => {
      const p = DEMO_PRODUCTS.find((x) => x.id === it.productId);
      const unit = p ? Number(p.price) : 0;
      const line = unit * it.quantity;
      subtotal += line;
      return {
        id: `new-i${idx}`,
        productName: p?.name ?? "Item",
        quantity: it.quantity,
        unitPrice: unit.toFixed(2),
        lineTotal: line.toFixed(2),
      };
    });
    const tax = subtotal * Number(DEMO_TENANT.taxRate);
    const total = subtotal + tax;
    const order: DemoOrder = {
      id: `30000000-0000-0000-0000-9999${DEMO_ORDERS.length}`,
      orderNumber: `BM-${1000 + DEMO_ORDERS.length + 1}`,
      customerName: data.customerName,
      customerPhone: data.customerPhone ?? null,
      customerEmail: data.customerEmail ?? null,
      status: data.status ?? "pending",
      paymentStatus: data.paymentStatus ?? "paid",
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      pickupNote: data.pickupNote ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items,
    };
    DEMO_ORDERS.unshift(order);
    return order;
  }
  const { createOrder } = await db();
  const t = await getTenant();
  return createOrder(t.id, { ...data, taxRate: Number((t as { taxRate: string }).taxRate) } as never);
}
