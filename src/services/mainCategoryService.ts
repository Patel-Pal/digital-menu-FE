import api from './api';

export interface MainCategory {
  _id: string;
  name: 'Starter' | 'Main Course' | 'Dessert' | 'None of the Above';
  icon: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const mainCategoryService = {
  // Get all main categories
  getAllMainCategories: async () => {
    const response = await api.get('/main-categories');
    return response.data;
  },

  // Initialize default main categories
  initializeMainCategories: async () => {
    const response = await api.post('/main-categories/initialize');
    return response.data;
  },

  // Create main category
  createMainCategory: async (data: Partial<MainCategory>) => {
    const response = await api.post('/main-categories', data);
    return response.data;
  }
};
