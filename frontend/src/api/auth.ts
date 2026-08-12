import { client } from './client';

export const authApi = {
  login: async (body: any) => {
    const res = await client.post('/auth/login', body);
    return res.data;
  },
  
  me: async () => {
    const res = await client.get('/auth/me');
    return res.data;
  },
  
  // Admin-only user management
  listUsers: async (params?: any) => {
    const res = await client.get('/users', { params });
    return res.data;
  },
  
  createUser: async (body: any) => {
    const res = await client.post('/users', body);
    return res.data;
  },
  
  updateUser: async (id: string, body: any) => {
    const res = await client.patch(`/users/${id}`, body);
    return res.data;
  },
};
