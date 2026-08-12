import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  sku: z.string().min(2, 'SKU must be at least 2 characters'),
  categoryId: z.string().uuid('Invalid category ID'),
  price: z.number().positive('Price must be positive'),
  currentStock: z.number().int().min(0, 'Stock cannot be negative').default(0),
  minimumStock: z.number().int().min(0, 'Minimum stock cannot be negative').default(10),
  warehouse: z.string().default('Main Warehouse'),
});

export const updateProductSchema = createProductSchema.partial().omit({ sku: true });

export const productQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  lowStock: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
