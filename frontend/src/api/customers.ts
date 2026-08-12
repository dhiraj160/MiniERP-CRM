import { client } from './client';

export const customersApi = {
  list: async (params?: any) => {
    const res = await client.get('/customers', { params });
    return res.data;
  },
  
  getById: async (id: string) => {
    const res = await client.get(`/customers/${id}`);
    return res.data;
  },
  
  create: async (body: any) => {
    const res = await client.post('/customers', body);
    return res.data;
  },
  
  update: async (id: string, body: any) => {
    const res = await client.patch(`/customers/${id}`, body);
    return res.data;
  },
  
  addNote: async (id: string, note: string) => {
    const res = await client.post(`/customers/${id}/notes`, { note });
    return res.data;
  },
  
  getFollowUps: async (params?: any) => {
    const res = await client.get('/customers/follow-ups', { params });
    return res.data;
  },
};
