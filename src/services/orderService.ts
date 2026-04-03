import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

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
  waiterId?: { _id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  success: boolean;
  data: Order[];
  counts: {
    pending: number;
    approved: number;
    rejected: number;
    completed: number;
    all: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
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

export interface TableBill {
  _id: string;
  billNumber: string;
  items: Array<{ name: string; price: number; quantity: number; totalPrice: number }>;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'cash' | 'card' | 'upi' | 'online';
  createdAt?: string;
  paidAt?: string;
  orderIds?: string[];
}

export interface TableData {
  tableNumber: string;
  customerName: string;
  orders: Order[];
  totalAmount: number;
  firstOrderTime: string;
  bill: TableBill | null;
}

export interface TableAggregationResponse {
  success: boolean;
  data: TableData[];
}

export type TableFilterType = 'all' | 'pending' | 'approved';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'online';

class OrderService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async createOrder(orderData: CreateOrderData) {
    const response = await axios.post(`${API_BASE_URL}/orders`, orderData, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async getShopOrders(shopId: string, status?: string, page = 1, limit = 20, waiterId?: string): Promise<OrderResponse> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    if (waiterId) params.append('waiterId', waiterId);
    
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

  async getTableAggregation(shopId: string, showAll = false): Promise<TableAggregationResponse> {
    const params = showAll ? '?showAll=true' : '';
    const response = await axios.get(
      `${API_BASE_URL}/orders/shop/${shopId}/tables${params}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }
}

export const orderService = new OrderService();
