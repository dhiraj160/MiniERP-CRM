import { z } from 'zod';

export const stockMoveSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  type: z.enum(['IN', 'OUT']),
  quantity: z.number().int().positive('Quantity must be positive'),
  reason: z.string().optional(),
});

export const stockQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  productId: z.string().optional(),
  type: z.enum(['IN', 'OUT']).optional(),
});

export type StockMoveInput = z.infer<typeof stockMoveSchema>;
