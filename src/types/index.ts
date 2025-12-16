// Menu Types
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  categoryId: string;
  available: boolean;
  popular?: boolean;
  vegetarian?: boolean;
  spicy?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  order: number;
}

export interface Menu {
  id: string;
  shopId: string;
  name: string;
  categories: Category[];
  items: MenuItem[];
}

// Shop Types
export interface Shop {
  id: string;
  name: string;
  logo?: string;
  banner?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  subscription: SubscriptionPlan;
  createdAt: string;
  qrScans: number;
}

export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise';

export interface Subscription {
  id: string;
  shopId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  price: number;
}

// Analytics Types
export interface AnalyticsData {
  date: string;
  scans: number;
  views: number;
  uniqueVisitors: number;
}

export interface DashboardStats {
  totalScans: number;
  totalViews: number;
  activeMenus: number;
  popularItems: MenuItem[];
  recentActivity: AnalyticsData[];
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'shopkeeper' | 'customer';
  avatar?: string;
  shopId?: string;
}

// UI Types
export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}
