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
  fiveHundred: "10000000-0000-0000-0000-000000000001",
  twoHundred: "10000000-0000-0000-0000-000000000002",
  fountains: "10000000-0000-0000-0000-000000000003",
  novelties: "10000000-0000-0000-0000-000000000004",
  reloadables: "10000000-0000-0000-0000-000000000005",
  rockets: "10000000-0000-0000-0000-000000000006",
  assortments: "10000000-0000-0000-0000-000000000007",
  romanCandles: "10000000-0000-0000-0000-000000000008",
  sparklers: "10000000-0000-0000-0000-000000000009",
  firingSystems: "10000000-0000-0000-0000-000000000010",
};

export const DEMO_CATEGORIES: DemoCategory[] = [
  { id: C.fiveHundred, name: "500 Gram", emoji: "🎂", sortOrder: 1 },
  { id: C.twoHundred, name: "200 Gram", emoji: "🎆", sortOrder: 2 },
  { id: C.fountains, name: "Fountains", emoji: "⛲", sortOrder: 3 },
  { id: C.novelties, name: "Novelties", emoji: "🎉", sortOrder: 4 },
  { id: C.reloadables, name: "Reloadables", emoji: "🧨", sortOrder: 5 },
  { id: C.rockets, name: "Rockets", emoji: "🚀", sortOrder: 6 },
  { id: C.assortments, name: "Assortments", emoji: "🎁", sortOrder: 7 },
  { id: C.romanCandles, name: "Roman Candles", emoji: "✨", sortOrder: 8 },
  { id: C.sparklers, name: "Sparklers", emoji: "✨", sortOrder: 9 },
  { id: C.firingSystems, name: "Firing Systems", emoji: "⚡", sortOrder: 10 },
];

const cat = (id: string) => DEMO_CATEGORIES.find((c) => c.id === id) ?? null;
const NOW = "2026-06-16T12:00:00.000Z";
const wpId = (id: number) => `20000000-0000-0000-0000-${String(id).padStart(12, "0")}`;

function mk(
  id: number,
  categoryId: string,
  name: string,
  description: string,
  price: string,
  inventoryQty: number,
  imageUrl: string,
  opts: Partial<DemoProduct> = {}
): DemoProduct {
  return {
    id: wpId(id),
    name,
    description,
    price,
    imageUrl,
    images: opts.images ?? [],
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
  mk(6660, C.firingSystems, "Ignite 2M Clip-On Ignitors", "A 20 pack of 2 meter IGNITE clip-on fuse igniters using the industry standard quick plug connector.", "22.00", 20, "https://fireworkssupermarket.com/wp-content/uploads/2M.png", { tags: ["Ignite", "accessory"] }),
  mk(6654, C.fiveHundred, "Outlaw Justice", "A combination of tails, palms, strobes, chrysanthemums, brocades, and sizzling color effects in red, gold, white, and green.", "59.99", 18, "https://fireworkssupermarket.com/wp-content/uploads/5874_01.png", { isFeatured: true, tags: ["Showtime", "new-product"] }),
  mk(6652, C.fiveHundred, "Fluorescent", "Big 16 shot 500 gram cake with red and gold strobe mines, orange, blue, and purple dahlias, blossoms, and crackle.", "59.99", 16, "https://fireworkssupermarket.com/wp-content/uploads/5875_01.png", { isFeatured: true, tags: ["Showtime", "16 Shots"] }),
  mk(6651, C.fiveHundred, "Dragon Blaze", "Twenty-four angled shots of gold to brocade with blue, purple, orange, sky blue, and crackling color combinations.", "59.99", 14, "https://fireworkssupermarket.com/wp-content/uploads/dragon-blaze.png", { tags: ["Showtime", "24 Shots"] }),
  mk(6649, C.fiveHundred, "Star Chaser", "A 115 shot zipper cake that rapid fires crackling comets, brocade crown, peony, strobes, chrysanthemums, and tails.", "139.99", 8, "https://fireworkssupermarket.com/wp-content/uploads/5827_01.png", { isFeatured: true, tags: ["Showtime", "115 Shots"] }),
  mk(6645, C.twoHundred, "Mutant Strain", "Twenty-five shots of chrysanthemums, mines, peonies, and strobes with bright blue and red colors.", "34.99", 24, "https://fireworkssupermarket.com/wp-content/uploads/2843_01.png", { tags: ["Showtime", "25 Shots"] }),
  mk(6609, C.fiveHundred, "Screeching Glory", "Peonies, chrysanthemums, and howling whistlers break into multi-color shots built to impress the neighborhood.", "84.99", 10, "https://fireworkssupermarket.com/wp-content/uploads/screeching-glory.png", { isFeatured: true, tags: ["Showtime", "30 Shots"] }),
  mk(6608, C.fiveHundred, "Cylozar", "A 36 shot extraterrestrial spectacle with cosmic color, crackle, and layered breaks across the night sky.", "79.99", 11, "https://fireworkssupermarket.com/wp-content/uploads/cylozar.png", { tags: ["Showtime", "36 Shots"] }),
  mk(6607, C.fiveHundred, "Valtor", "Forty-five fanned shots with crackling mines, split time rain, dahlias, and grand color movement.", "99.99", 9, "https://fireworkssupermarket.com/wp-content/uploads/valtor.png", { tags: ["Showtime", "45 Shots"] }),
  mk(6606, C.twoHundred, "Backbender", "Sixteen shots of whirlpools and chrysanthemums in purple, red, green, and blue.", "24.99", 30, "https://fireworkssupermarket.com/wp-content/uploads/backbender.png", { tags: ["Showtime", "16 Shots"] }),
  mk(6410, C.reloadables, "Power Bomb", "A variety of 6 inch shells with large brocades, color-changing strobes, and hard-hitting reloadable effects.", "89.99", 12, "https://fireworkssupermarket.com/wp-content/uploads/2957_01.png", { isFeatured: true, tags: ["Showtime", "reloadable"] }),
  mk(6528, C.fiveHundred, "Bubsy", "A 28 shot fanned cake with chrysanthemums, dahlias, color, and playful rainbow-inspired pacing.", "79.99", 13, "https://fireworkssupermarket.com/wp-content/uploads/bubsy.png", { tags: ["Showtime", "28 Shots"] }),
  mk(5893, C.rockets, "Strobe Storm", "A flashing strobe rocket climbs high, then breaks with a boom into sparkling glitter.", "39.99", 25, "https://fireworkssupermarket.com/wp-content/uploads/1558_01.png", { tags: ["Showtime"] }),
  mk(5966, C.fiveHundred, "Meteor Mania", "Twenty-five glowing dahlias in lemon, green, blue, orange, and purple streak across the sky.", "99.99", 10, "https://fireworkssupermarket.com/wp-content/uploads/5905_01.png", { tags: ["Showtime", "25 Shots"] }),
  mk(5892, C.romanCandles, "Spirit Candles", "Each candle fires unique brocade, willow, glitter, fish, and crackle effects.", "16.99", 40, "https://fireworkssupermarket.com/wp-content/uploads/1397_01.png", { tags: ["Showtime", "5 Shots"] }),
  mk(6271, C.assortments, "Liberty Box", "A mammoth assortment packed with Showtime 200g and 500g cakes in one powerhouse box.", "999.99", 2, "https://fireworkssupermarket.com/wp-content/uploads/3378_01.png", { isFeatured: true, tags: ["Showtime", "assortment"] }),
  mk(5946, C.reloadables, "Freedom's Crack", "A set of 30mm tubes with four distinct aerial moments and clearly marked effects.", "14.99", 36, "https://fireworkssupermarket.com/wp-content/uploads/4652_01.png", { tags: ["Showtime", "reloadable"] }),
  mk(6261, C.reloadables, "Talons of Thunder", "Twelve individual 45mm tubes, each with a distinct tail and powerful aerial effect.", "69.99", 16, "https://fireworkssupermarket.com/wp-content/uploads/4651_01.png", { tags: ["Showtime", "12 Shots"] }),
  mk(5953, C.twoHundred, "Yuuuuge!", "Seven massive golden willows lighting up the sky with red, white, and blue color.", "49.99", 18, "https://fireworkssupermarket.com/wp-content/uploads/5896_01.png", { tags: ["Showtime", "7 Shots"] }),
  mk(5970, C.fiveHundred, "Wings of Valor", "Forty-eight heroic shots spread gold coco tails and colorful stars across the sky.", "175.00", 7, "https://fireworkssupermarket.com/wp-content/uploads/5909_01.png", { isFeatured: true, tags: ["Showtime", "48 Shots"] }),
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
