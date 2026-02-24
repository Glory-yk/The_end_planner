import client from './client';
import { MandalartData } from '@/types/mandalart';

interface MandalartApiResponse {
  data: MandalartData;
}

export const mandalartApi = {
  // Get user's mandalart data
  async get(): Promise<MandalartData> {
    const response = await client.get<MandalartApiResponse>('/mandalart');
    return response.data.data;
  },

  // Update user's mandalart data
  async update(data: MandalartData): Promise<MandalartData> {
    const response = await client.put<MandalartApiResponse>('/mandalart', { data });
    return response.data.data;
  },
};

export default mandalartApi;
