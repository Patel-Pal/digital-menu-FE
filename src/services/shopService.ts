import api from './api';

interface Shop {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  address?: string;
  phone?: string;
  email?: string;
  ownerId: string;
  subscription: string;
  isActive: boolean;
  qrScans: number;
  createdAt: string;
  updatedAt: string;
}

interface ShopProfileData {
  description?: string;
  logo?: string;
  banner?: string;
  address?: string;
  phone?: string;
}

export const shopService = {
  // Get shop profile
  getShopProfile: async () => {
    const response = await api.get('/shops/profile');
    return response.data;
  },

  // Create or update shop profile
  createOrUpdateShopProfile: async (data: ShopProfileData) => {
    const response = await api.post('/shops/profile', data);
    return response.data;
  }
};

export type { Shop, ShopProfileData };
