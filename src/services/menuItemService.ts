import api from './api';

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoryId: {
    _id: string;
    name: string;
    icon?: string;
  };
  ingredients: string[];
  available: boolean;
  isActive: boolean;
  popular: boolean;
  vegetarian: boolean;
  spicy: boolean;
  shopId: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateMenuItemData {
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoryId: string;
  ingredients?: string[];
  available?: boolean;
  popular?: boolean;
  vegetarian?: boolean;
  spicy?: boolean;
  shopId: string;
}

interface UpdateMenuItemData {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  categoryId?: string;
  ingredients?: string[];
  available?: boolean;
  popular?: boolean;
  vegetarian?: boolean;
  spicy?: boolean;
  isActive?: boolean;
}

export const menuItemService = {
  // Get active menu items (public)
  getMenuItemsByShop: async (shopId: string) => {
    const response = await api.get(`/menu-items/shop/${shopId}`);
    return response.data;
  },

  // Get all menu items for management (private)
  getAllMenuItemsForManagement: async (shopId: string) => {
    const response = await api.get(`/menu-items/manage/${shopId}`);
    return response.data;
  },

  // Create menu item
  createMenuItem: async (data: CreateMenuItemData) => {
    const response = await api.post('/menu-items', data);
    return response.data;
  },

  // Update menu item
  updateMenuItem: async (id: string, data: UpdateMenuItemData) => {
    const response = await api.put(`/menu-items/${id}`, data);
    return response.data;
  },

  // Toggle menu item status
  toggleMenuItemStatus: async (id: string) => {
    const response = await api.patch(`/menu-items/${id}/toggle`);
    return response.data;
  },

  // Delete menu item
  deleteMenuItem: async (id: string) => {
    const response = await api.delete(`/menu-items/${id}`);
    return response.data;
  }
};

export type { MenuItem, CreateMenuItemData, UpdateMenuItemData };
