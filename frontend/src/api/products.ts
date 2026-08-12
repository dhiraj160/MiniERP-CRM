import { client } from './client';

export const productsApi = {
  list: async (params?: any) => {
    const res = await client.get('/products', { params });
    return res.data;
  },
  
  getById: async (id: string) => {
    const res = await client.get(`/products/${id}`);
    return res.data;
  },
  
  create: async (body: any) => {
    const res = await client.post('/products', body);
    return res.data;
  },
  
  update: async (id: string, body: any) => {
    const res = await client.patch(`/products/${id}`, body);
    return res.data;
  },
  
  getLowStock: async (params?: any) => {
    const res = await client.get('/products/low-stock', { params });
    return res.data;
  },
  
  // Categories
  listCategories: async () => {
    const res = await client.get('/categories');
    return res.data;
  },
  
  createCategory: async (name: string) => {
    const res = await client.post('/categories', { name });
    return res.data;
  },
  
  // Stock Movements
  recordMovement: async (body: any) => {
    const res = await client.post('/stock/move', body);
    return res.data;
  },
  
  listMovements: async (params?: any) => {
    const res = await client.get('/stock/movements', { params });
    return res.data;
  },
};
