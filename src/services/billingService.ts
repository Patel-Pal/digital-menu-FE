import api from './api';

export interface BillItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface Bill {
  _id: string;
  billNumber: string;
  shopId: string;
  customerName: string;
  deviceId: string;
  tableNumber: string;
  orderIds: string[];
  items: BillItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'cash' | 'card' | 'upi' | 'online';
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateBillData {
  customerName: string;
  deviceId: string;
  shopId: string;
  tableNumber: string;
}

export interface UpdatePaymentData {
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod?: 'cash' | 'card' | 'upi' | 'online';
}

class BillingService {
  async generateBill(billData: GenerateBillData) {
    const response = await api.post('/billing/generate', billData);
    return response.data;
  }

  async updatePaymentStatus(billId: string, paymentData: UpdatePaymentData) {
    const response = await api.put(`/billing/${billId}/payment`, paymentData);
    return response.data;
  }

  async getCustomerBills(deviceId: string, shopId?: string) {
    const params = shopId ? `?shopId=${shopId}` : '';
    const response = await api.get(`/billing/customer/${deviceId}${params}`);
    return response.data;
  }

  async getShopBills(shopId: string, status?: string, page = 1, limit = 20) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    
    const response = await api.get(`/billing/shop/${shopId}?${params}`);
    return response.data;
  }

  async getBillingAnalytics(shopId: string, period: 'daily' | 'weekly' | 'monthly' = 'daily', days = 30) {
    const params = new URLSearchParams({ 
      period, 
      days: days.toString() 
    });
    
    const response = await api.get(`/billing/analytics/${shopId}?${params}`);
    return response.data;
  }

  async getBill(billId: string) {
    const response = await api.get(`/billing/${billId}`);
    return response.data;
  }
}

export const billingService = new BillingService();
