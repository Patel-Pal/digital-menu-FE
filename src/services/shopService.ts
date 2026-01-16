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
  menuTheme: string;
  rating?: number;
  reviewCount?: number;
}

interface ShopProfileData {
  description?: string;
  logo?: string;
  banner?: string;
  address?: string;
  phone?: string;
  menuTheme?: string;
  type?: string;
}

export const shopService = {
  // Get shop profile
  getShopProfile: async () => {
    try {
      console.log('Fetching shop profile...');
      const token = localStorage.getItem('token');
      console.log('Using token:', token ? 'Present' : 'Missing');
      
      const response = await api.get('/shops/profile');
      console.log('Shop profile response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Shop profile error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Create or update shop profile
  createOrUpdateShopProfile: async (data: ShopProfileData) => {
    try {
      console.log('Creating/updating shop profile with data:', data);
      const response = await api.post('/shops/profile', data);
      console.log('Shop profile update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Shop profile update error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Get shop by owner ID
  getShopByOwnerId: async (ownerId: string) => {
    try {
      const response = await api.get(`/shops/${ownerId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get shop by owner ID error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get shop analytics
  getShopAnalytics: async () => {
    try {
      const response = await api.get(`/shops/analytics?t=${Date.now()}`);
      return response.data;
    } catch (error: any) {
      console.error('Shop analytics error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Increment scan count
  incrementScan: async (ownerId: string) => {
    try {
      const response = await api.post(`/shops/${ownerId}/scan`);
      return response.data;
    } catch (error: any) {
      console.error('Increment scan error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Increment view count
  incrementView: async (ownerId: string) => {
    try {
      const response = await api.post(`/shops/${ownerId}/view`);
      return response.data;
    } catch (error: any) {
      console.error('Increment view error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get detailed shop analytics
  getDetailedAnalytics: async () => {
    try {
      const response = await api.get(`/shops/analytics/detailed?t=${Date.now()}`);
      return response.data;
    } catch (error: any) {
      console.error('Detailed analytics error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export type { Shop, ShopProfileData };
