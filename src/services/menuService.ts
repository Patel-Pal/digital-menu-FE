import api from './api';
import type { Menu, MenuItem } from '@/types';

export interface CreateMenuData {
  shopId: string;
  name: string;
  categories: Array<{
    name: string;
    icon?: string;
    order: number;
  }>;
}

export const menuService = {
  getMenuByShop: async (shopId: string) => {
    const response = await api.get(`/menus/shop/${shopId}`);
    return response.data;
  },

  createOrUpdateMenu: async (data: CreateMenuData) => {
    const response = await api.post('/menus', data);
    return response.data;
  },

  addMenuItem: async (menuId: string, item: Omit<MenuItem, 'id'>) => {
    const response = await api.post(`/menus/${menuId}/items`, item);
    return response.data;
  },

  updateMenuItem: async (menuId: string, itemId: string, item: Partial<MenuItem>) => {
    const response = await api.put(`/menus/${menuId}/items/${itemId}`, item);
    return response.data;
  },

  deleteMenuItem: async (menuId: string, itemId: string) => {
    const response = await api.delete(`/menus/${menuId}/items/${itemId}`);
    return response.data;
  }
};
