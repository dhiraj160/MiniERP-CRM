import { client } from './client';

export const challansApi = {
  list: async (params?: any) => {
    const res = await client.get('/challans', { params });
    return res.data;
  },
  
  getById: async (id: string) => {
    const res = await client.get(`/challans/${id}`);
    return res.data;
  },
  
  create: async (body: any) => {
    const res = await client.post('/challans', body);
    return res.data;
  },
  
  update: async (id: string, body: any) => {
    const res = await client.patch(`/challans/${id}`, body);
    return res.data;
  },
  
  confirm: async (id: string) => {
    const res = await client.post(`/challans/${id}/confirm`);
    return res.data;
  },
  
  cancel: async (id: string) => {
    const res = await client.post(`/challans/${id}/cancel`);
    return res.data;
  },
};
