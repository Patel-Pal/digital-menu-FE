import api from './api';

interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  shopId: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateCategoryData {
  name: string;
  description?: string;
  icon?: string;
  order?: number;
  shopId: string;
}

interface UpdateCategoryData {
  name?: string;
  description?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
}

export const categoryService = {
  // Get active categories (public)
  getCategoriesByShop: async (shopId: string) => {
    const response = await api.get(`/categories/shop/${shopId}`);
    return response.data;
  },

  // Get all categories for management (private)
  getAllCategoriesForManagement: async (shopId: string) => {
    const response = await api.get(`/categories/manage/${shopId}`);
    return response.data;
  },

  // Create category
  createCategory: async (data: CreateCategoryData) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  // Update category
  updateCategory: async (id: string, data: UpdateCategoryData) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  // Toggle category status
  toggleCategoryStatus: async (id: string) => {
    const response = await api.patch(`/categories/${id}/toggle`);
    return response.data;
  },

  // Delete category
  deleteCategory: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

export type { Category, CreateCategoryData, UpdateCategoryData };
