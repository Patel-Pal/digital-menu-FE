import api from './api';
import type {
  DiscountConfig,
  ActiveDiscounts,
  SpinResult,
  ScratchResult,
  CouponValidation,
  DiscountReward,
  LoyaltyProgress,
} from '@/types/discount';

class DiscountService {
  async getDiscountConfig(shopId: string): Promise<DiscountConfig> {
    const response = await api.get(`/discounts/config/${shopId}`);
    return response.data.data;
  }

  async updateDiscountConfig(shopId: string, config: Partial<DiscountConfig>): Promise<DiscountConfig> {
    const response = await api.put(`/discounts/config/${shopId}`, config);
    return response.data.data;
  }

  async getActiveDiscounts(shopId: string): Promise<ActiveDiscounts> {
    const response = await api.get(`/discounts/active/${shopId}`);
    return response.data.data;
  }

  async spinWheel(shopId: string, deviceId: string): Promise<SpinResult> {
    const response = await api.post(`/discounts/spin/${shopId}`, { deviceId });
    return response.data.data;
  }

  async scratchCard(shopId: string, deviceId: string): Promise<ScratchResult> {
    const response = await api.post(`/discounts/scratch/${shopId}`, { deviceId });
    return response.data.data;
  }

  async validateCoupon(shopId: string, code: string, orderAmount: number): Promise<CouponValidation> {
    const response = await api.post('/discounts/coupon/validate', { shopId, code, orderAmount });
    return response.data.data;
  }

  async getCustomerRewards(shopId: string, deviceId: string): Promise<DiscountReward[]> {
    const response = await api.get(`/discounts/rewards/${shopId}/${deviceId}`);
    return response.data.data;
  }

  async getLoyaltyProgress(shopId: string, deviceId: string): Promise<LoyaltyProgress> {
    const response = await api.get(`/discounts/loyalty/${shopId}/${deviceId}`);
    return response.data.data;
  }
}

export const discountService = new DiscountService();
