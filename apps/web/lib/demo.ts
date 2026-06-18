/**
 * In-memory demo dataset for Big MO's Bangers. Powers the public Vercel preview
 * when there's no database. Shapes mirror the @bangers/db read models closely
 * enough for every page and API route the storefront + dashboard use.
 */
import catalogRows from "./fireworks-supermarket-catalog.json";

export interface DemoCategory {
  id: string;
  name: string;
  emoji: string;
  sortOrder: number;
}

export interface DemoProduct {
  id: string;
  name: string;
  description: string;
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
  category: DemoCategory | null;
  sku: string | null;
  barcode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DemoOrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
}

export interface DemoOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  status: string;
  paymentStatus: string;
  subtotal: string;
  tax: string;
  total: string;
  pickupNote: string | null;
  createdAt: string;
  updatedAt: string;
  items: DemoOrderItem[];
}

export const DEMO_TENANT = {
  id: "00000000-0000-0000-0000-000000000001",
  businessName: "Big MO's Bangers",
  slug: "bigmos",
  phone: "417-555-0100",
  email: "howdy@bigmosbangers.com",
  address: "123 Main St",
  city: "Republic",
  state: "MO",
  zip: "65738",
  logoUrl: "/brand/logo.png",
  primaryColor: "#FF3B30",
  timezone: "America/Chicago",
  taxRate: "0.0825",
};

const NOW = "2026-06-16T12:00:00.000Z";
const SOURCE_PREFIX = "fwsm-";

type CatalogRow = {
  name: string;
  sku: string;
  barcode?: string | null;
  sourceId?: string | null;
  supplierSku?: string | null;
  category: string;
  price: string;
  qty: number;
  image: string | null;
  images: string[];
  video: string | null;
  description: string;
  featured: boolean;
};

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "item";
}

function sourceProductId(sku: string): string {
  return sku.startsWith(SOURCE_PREFIX) ? sku.slice(SOURCE_PREFIX.length) : sku;
}

function productId(sku: string): string {
  return `fwsm-${sourceProductId(sku)}`;
}

function categoryEmoji(name: string): string {
  const key = name.toLowerCase();
  if (key.includes("500")) return "🎂";
  if (key.includes("200")) return "🎆";
  if (key.includes("fountain")) return "⛲";
  if (key.includes("novelt")) return "🎉";
  if (key.includes("reload") || key.includes("shell")) return "🧨";
  if (key.includes("rocket")) return "🚀";
  if (key.includes("assort")) return "🎁";
  if (key.includes("roman")) return "✨";
  if (key.includes("sparkler")) return "✨";
  if (key.includes("firing")) return "⚡";
  if (key.includes("finale")) return "💥";
  return "🎇";
}

const rows = catalogRows as unknown as CatalogRow[];
const categoryNames = Array.from(new Set(rows.map((row) => row.category || "Uncategorized")));

export const DEMO_CATEGORIES: DemoCategory[] = categoryNames.map((name, index) => ({
  id: `fwsm-category-${slug(name)}`,
  name,
  emoji: categoryEmoji(name),
  sortOrder: index + 1,
}));

const categoryByName = new Map(DEMO_CATEGORIES.map((category) => [category.name, category]));

export const DEMO_PRODUCTS: DemoProduct[] = rows.map((row, index) => {
  const category = categoryByName.get(row.category || "Uncategorized") ?? null;
  return {
    id: productId(row.sourceId || row.sku || String(index + 1)),
    name: row.name,
    description: row.description,
    price: row.price,
    imageUrl: row.image,
    images: row.images,
    youtubeUrl: row.video,
    streamVideoId: null,
    inventoryQty: Number.isFinite(row.qty) ? row.qty : 0,
    lowStockThreshold: 5,
    trackInventory: true,
    isFeatured: row.featured || Boolean(row.video),
    isActive: true,
    sku: row.sku || null,
    barcode: row.barcode || row.sku || null,
    tags: [
      row.sku,
      row.barcode,
      row.sourceId,
      row.supplierSku,
      row.sku ? `sku:${row.sku}` : null,
      row.barcode ? `barcode:${row.barcode}` : null,
      row.sourceId ? `source-id:${row.sourceId}` : null,
      `source:fireworks-supermarket`,
    ].filter(Boolean) as string[],
    categoryId: category?.id ?? null,
    category,
    createdAt: NOW,
    updatedAt: NOW,
  };
});

export const DEMO_ORDERS: DemoOrder[] = [
  {
    id: "30000000-0000-0000-0000-000000000001",
    orderNumber: "BM-1001",
    customerName: "Hank Dillard",
    customerPhone: "417-555-2210",
    customerEmail: "hank@example.com",
    status: "pending",
    paymentStatus: "paid",
    subtotal: "164.97",
    tax: "13.61",
    total: "178.58",
    pickupNote: "Pickup around 6pm Friday",
    createdAt: "2026-06-16T15:10:00.000Z",
    updatedAt: "2026-06-16T15:10:00.000Z",
    items: [
      { id: "i1", productName: "Galaxy Buster 500 Shot", quantity: 1, unitPrice: "129.99", lineTotal: "129.99" },
      { id: "i2", productName: "Gold Glitter Fountain", quantity: 1, unitPrice: "14.99", lineTotal: "14.99" },
      { id: "i3", productName: "Family Fun Assortment", quantity: 1, unitPrice: "29.99", lineTotal: "29.99" },
    ],
  },
  {
    id: "30000000-0000-0000-0000-000000000002",
    orderNumber: "BM-1002",
    customerName: "Becky Sumner",
    customerPhone: "417-555-7788",
    customerEmail: null,
    status: "confirmed",
    paymentStatus: "paid",
    subtotal: "99.98",
    tax: "8.25",
    total: "108.23",
    pickupNote: null,
    createdAt: "2026-06-16T16:02:00.000Z",
    updatedAt: "2026-06-16T16:20:00.000Z",
    items: [
      { id: "i4", productName: "Red Titan Aerial", quantity: 2, unitPrice: "49.99", lineTotal: "99.98" },
    ],
  },
  {
    id: "30000000-0000-0000-0000-000000000003",
    orderNumber: "BM-1003",
    customerName: "Travis Cole",
    customerPhone: "417-555-3344",
    customerEmail: "travis@example.com",
    status: "ready",
    paymentStatus: "paid",
    subtotal: "89.99",
    tax: "7.42",
    total: "97.41",
    pickupNote: "Call when ready",
    createdAt: "2026-06-16T13:40:00.000Z",
    updatedAt: "2026-06-16T14:55:00.000Z",
    items: [
      { id: "i5", productName: "Patriot Pride 500g", quantity: 1, unitPrice: "89.99", lineTotal: "89.99" },
    ],
  },
  {
    id: "30000000-0000-0000-0000-000000000004",
    orderNumber: "BM-1004",
    customerName: "Hank Dillard",
    customerPhone: "417-555-2210",
    customerEmail: "hank@example.com",
    status: "completed",
    paymentStatus: "paid",
    subtotal: "44.97",
    tax: "3.71",
    total: "48.68",
    pickupNote: null,
    createdAt: "2026-06-15T18:30:00.000Z",
    updatedAt: "2026-06-15T19:10:00.000Z",
    items: [
      { id: "i6", productName: "Jumbo Sparklers 36\"", quantity: 3, unitPrice: "8.99", lineTotal: "26.97" },
      { id: "i7", productName: "Purple Rain Fountain", quantity: 1, unitPrice: "12.99", lineTotal: "12.99" },
      { id: "i8", productName: "Snap Pops Bag", quantity: 1, unitPrice: "3.99", lineTotal: "3.99" },
    ],
  },
];

export interface DemoCustomer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  totalOrders: number;
  totalSpent: string;
  lastOrderAt: string | null;
  createdAt: string;
}

export function demoCustomers(): DemoCustomer[] {
  const map = new Map<string, DemoCustomer>();
  for (const o of DEMO_ORDERS) {
    const key = o.customerPhone ?? o.customerName;
    const existing = map.get(key);
    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent = (Number(existing.totalSpent) + Number(o.total)).toFixed(2);
      if (!existing.lastOrderAt || o.createdAt > existing.lastOrderAt) {
        existing.lastOrderAt = o.createdAt;
      }
    } else {
      map.set(key, {
        id: `40000000-0000-0000-0000-0000000000${map.size + 1}`,
        name: o.customerName,
        phone: o.customerPhone,
        email: o.customerEmail,
        totalOrders: 1,
        totalSpent: o.total,
        lastOrderAt: o.createdAt,
        createdAt: o.createdAt,
      });
    }
  }
  return [...map.values()];
}
