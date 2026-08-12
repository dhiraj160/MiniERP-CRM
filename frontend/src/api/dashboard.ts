import { client } from './client';

export const dashboardApi = {
  getStats: async () => {
    const res = await client.get('/dashboard/stats');
    return res.data;
  },
};
