import api from './api';
import { Waiter, CreateWaiterData } from '../types';

class WaiterService {
  async createWaiter(shopId: string, data: CreateWaiterData): Promise<Waiter> {
    const response = await api.post(`/shops/${shopId}/waiters`, data);
    return response.data;
  }

  async getShopWaiters(shopId: string): Promise<Waiter[]> {
    const response = await api.get(`/shops/${shopId}/waiters`);
    return response.data;
  }

  async updateWaiter(shopId: string, waiterId: string, data: Partial<Omit<Waiter, 'id' | 'createdAt'>>): Promise<Waiter> {
    const response = await api.put(`/shops/${shopId}/waiters/${waiterId}`, data);
    return response.data;
  }

  async deleteWaiter(shopId: string, waiterId: string): Promise<void> {
    await api.delete(`/shops/${shopId}/waiters/${waiterId}`);
  }
}

export const waiterService = new WaiterService();
