import { z } from 'zod';

export const challanItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
});

export const createChallanSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  notes: z.string().optional(),
  items: z.array(challanItemSchema).min(1, 'Challan must contain at least one item'),
  status: z.enum(['DRAFT', 'CONFIRMED']).default('DRAFT'),
});

export const updateChallanSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID').optional(),
  notes: z.string().optional(),
  items: z.array(challanItemSchema).min(1, 'Challan must contain at least one item').optional(),
});

export const challanQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  customerId: z.string().uuid('Invalid customer ID').optional(),
  status: z.enum(['DRAFT', 'CONFIRMED', 'CANCELLED']).optional(),
  search: z.string().optional(),
});

export type CreateChallanInput = z.infer<typeof createChallanSchema>;
export type UpdateChallanInput = z.infer<typeof updateChallanSchema>;
