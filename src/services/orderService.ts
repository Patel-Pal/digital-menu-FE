import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  shopId: string;
  customerName: string;
  tableNumber: string;
  orderNotes?: string;
  deviceId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  billingStatus?: 'unbilled' | 'billed';
  estimatedReadyTime?: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  shopId: string;
  customerName: string;
  tableNumber: string;
  orderNotes?: string;
  deviceId: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
  }>;
}

export interface UpdateOrderStatusData {
  status: 'approved' | 'rejected' | 'completed';
  estimatedReadyTime?: number;
  rejectionReason?: string;
}

class OrderService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async createOrder(orderData: CreateOrderData) {
    const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
    return response.data;
  }

  async getShopOrders(shopId: string, status?: string, page = 1, limit = 20) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    
    const response = await axios.get(
      `${API_BASE_URL}/orders/shop/${shopId}?${params}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async updateOrderStatus(orderId: string, statusData: UpdateOrderStatusData) {
    const response = await axios.put(
      `${API_BASE_URL}/orders/${orderId}/status`,
      statusData,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async getCustomerOrders(deviceId: string, shopId?: string) {
    const params = shopId ? `?shopId=${shopId}` : '';
    const response = await axios.get(`${API_BASE_URL}/orders/customer/${deviceId}${params}`);
    return response.data;
  }

  async getOrder(orderId: string) {
    const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
    return response.data;
  }
}

export const orderService = new OrderService();
