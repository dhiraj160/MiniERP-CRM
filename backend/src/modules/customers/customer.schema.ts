import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  businessName: z.string().optional(),
  gstNumber: z.string().optional(),
  customerType: z.enum(['RETAILER', 'WHOLESALER', 'DISTRIBUTOR']).default('RETAILER'),
  address: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'LEAD']).default('ACTIVE'),
  followUpDate: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const addNoteSchema = z.object({
  note: z.string().min(1, 'Note cannot be empty'),
});

export const customerQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'LEAD']).optional(),
  customerType: z.enum(['RETAILER', 'WHOLESALER', 'DISTRIBUTOR']).optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type AddNoteInput = z.infer<typeof addNoteSchema>;
