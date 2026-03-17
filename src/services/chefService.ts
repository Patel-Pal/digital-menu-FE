import api from './api';
import { Chef, CreateChefData } from '../types';

class ChefService {
  async createChef(shopId: string, data: CreateChefData): Promise<Chef> {
    const response = await api.post(`/shops/${shopId}/chefs`, data);
    return response.data;
  }

  async getShopChefs(shopId: string): Promise<Chef[]> {
    const response = await api.get(`/shops/${shopId}/chefs`);
    return response.data;
  }

  async updateChef(shopId: string, chefId: string, data: Partial<Omit<Chef, 'id' | 'createdAt'>>): Promise<Chef> {
    const response = await api.put(`/shops/${shopId}/chefs/${chefId}`, data);
    return response.data;
  }

  async deleteChef(shopId: string, chefId: string): Promise<void> {
    await api.delete(`/shops/${shopId}/chefs/${chefId}`);
  }
}

export const chefService = new ChefService();
