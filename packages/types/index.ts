import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{2})?$/),
  categoryId: z.string().uuid().optional(),
  imageUrl: z.string().url().optional(),
  images: z.array(z.string().url()).default([]),
  inventoryQty: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  trackInventory: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  youtubeUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const CreateOrderSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional(),
  pickupNote: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(["confirmed", "ready", "completed", "cancelled"]),
});

export const AdjustInventorySchema = z.object({
  qtyChange: z.number().int(),
  reason: z.enum(["manual_add", "manual_remove", "adjustment"]),
  note: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
export type AdjustInventoryInput = z.infer<typeof AdjustInventorySchema>;
