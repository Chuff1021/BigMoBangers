/**
 * In-memory demo dataset for Big MO's Bangers. Powers the public Vercel preview
 * when there's no database. Shapes mirror the @bangers/db read models closely
 * enough for every page and API route the storefront + dashboard use.
 */

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

const C = {
  aerials: "10000000-0000-0000-0000-000000000001",
  fountains: "10000000-0000-0000-0000-000000000002",
  cakes: "10000000-0000-0000-0000-000000000003",
  sparklers: "10000000-0000-0000-0000-000000000004",
  assortments: "10000000-0000-0000-0000-000000000005",
  novelties: "10000000-0000-0000-0000-000000000006",
};

export const DEMO_CATEGORIES: DemoCategory[] = [
  { id: C.aerials, name: "Aerials", emoji: "🎆", sortOrder: 1 },
  { id: C.fountains, name: "Fountains", emoji: "⛲", sortOrder: 2 },
  { id: C.cakes, name: "500g Cakes", emoji: "🎂", sortOrder: 3 },
  { id: C.sparklers, name: "Sparklers", emoji: "✨", sortOrder: 4 },
  { id: C.assortments, name: "Assortments", emoji: "🎁", sortOrder: 5 },
  { id: C.novelties, name: "Novelties", emoji: "🎉", sortOrder: 6 },
];

const cat = (id: string) => DEMO_CATEGORIES.find((c) => c.id === id) ?? null;
const NOW = "2026-06-16T12:00:00.000Z";

function mk(
  i: number,
  categoryId: string,
  name: string,
  description: string,
  price: string,
  inventoryQty: number,
  opts: Partial<DemoProduct> = {}
): DemoProduct {
  return {
    id: `20000000-0000-0000-0000-0000000000${(i + 10).toString().padStart(2, "0")}`,
    name,
    description,
    price,
    imageUrl: null,
    images: [],
    youtubeUrl: opts.youtubeUrl ?? null,
    streamVideoId: null,
    inventoryQty,
    lowStockThreshold: 5,
    trackInventory: opts.trackInventory ?? true,
    isFeatured: opts.isFeatured ?? false,
    isActive: true,
    tags: opts.tags ?? [],
    categoryId,
    category: cat(categoryId),
    createdAt: NOW,
    updatedAt: NOW,
  };
}

export const DEMO_PRODUCTS: DemoProduct[] = [
  mk(1, C.aerials, "Red Titan Aerial", "200 shot red chrysanthemum with gold glitter", "49.99", 24, { isFeatured: true, tags: ["bestseller"] }),
  mk(2, C.cakes, "Missouri Monster 500g Cake", "100 shot fan cake with color crossettes", "79.99", 12, { isFeatured: true, tags: ["finale"] }),
  mk(3, C.fountains, "Gold Glitter Fountain", "90 second gold glitter fountain", "14.99", 48),
  mk(4, C.aerials, "Blue Thunder Aerial", "36 shot blue peony with silver tail", "34.99", 18),
  mk(5, C.sparklers, 'Jumbo Sparklers 36"', "Pack of 12 jumbo gold sparklers", "8.99", 100, { tags: ["family"] }),
  mk(6, C.assortments, "Family Fun Assortment", "50 piece family assortment — fountains, sparklers, and poppers", "29.99", 30, { isFeatured: true }),
  mk(7, C.cakes, "Patriot Pride 500g", "Red, white, and blue 120 shot fan cake", "89.99", 8, { tags: ["patriotic"] }),
  mk(8, C.fountains, "Purple Rain Fountain", "60 second purple and silver fountain", "12.99", 36),
  mk(9, C.novelties, "Snap Pops Bag", "50 count snap pop bag", "3.99", 200, { trackInventory: false }),
  mk(10, C.aerials, "Galaxy Buster 500 Shot", "500 shot multi-color aerial finale", "129.99", 6, { isFeatured: true, tags: ["finale", "bestseller"] }),
];

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
