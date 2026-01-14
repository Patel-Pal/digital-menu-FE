import api from './api';

export const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Users
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  updateUserStatus: async (userId: string, isActive: boolean) => {
    const response = await api.put(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  },

  // Shops
  getAllShops: async (params?: { search?: string; status?: string; subscription?: string; page?: number; limit?: number }) => {
    const response = await api.get('/admin/shops', { params });
    return response.data;
  },

  updateShopStatus: async (shopId: string, isActive: boolean) => {
    const response = await api.put(`/admin/shops/${shopId}/status`, { isActive });
    return response.data;
  },

  deleteShop: async (shopId: string) => {
    const response = await api.delete(`/admin/shops/${shopId}`);
    return response.data;
  },

  // Analytics
  getAnalytics: async (period: string = '7') => {
    const response = await api.get(`/admin/analytics?period=${period}`);
    return response.data;
  },

  // Subscriptions
  getSubscriptions: async () => {
    const response = await api.get('/admin/subscriptions');
    return response.data;
  },

  // Contact Info
  getContactInfo: async () => {
    const response = await api.get('/admin/contact');
    return response.data;
  },

  getAllContactInfo: async () => {
    const response = await api.get('/admin/contact/all');
    return response.data;
  },

  createContactInfo: async (data: { email: string; phone: string; address: string }) => {
    const response = await api.post('/admin/contact/new', data);
    return response.data;
  },

  updateContactInfo: async (data: { email: string; phone: string; address: string }) => {
    const response = await api.post('/admin/contact', data);
    return response.data;
  },

  editContactInfo: async (id: string, data: { email: string; phone: string; address: string }) => {
    const response = await api.put(`/admin/contact/${id}`, data);
    return response.data;
  },

  deleteContactInfo: async (id: string) => {
    const response = await api.delete(`/admin/contact/${id}`);
    return response.data;
  },

  setActiveContactInfo: async (id: string) => {
    const response = await api.put(`/admin/contact/${id}/activate`);
    return response.data;
  }
};
