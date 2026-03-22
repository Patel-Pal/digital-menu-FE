export interface SpinWheelSegment {
  _id?: string;
  label: string;
  rewardType: 'percentage' | 'flat' | 'freeItem';
  rewardValue: number;
  probability: number;
}

export interface ScratchCardReward {
  _id?: string;
  label: string;
  rewardType: 'percentage' | 'flat';
  rewardValue: number;
  probability: number;
}

export interface Coupon {
  _id?: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  expiryDate: string;
  maxUsage: number;
  currentUsage: number;
  minOrderAmount: number;
  isActive: boolean;
}

export interface SpinWheelConfig {
  enabled: boolean;
  segments: SpinWheelSegment[];
}

export interface ScratchCardConfig {
  enabled: boolean;
  rewards: ScratchCardReward[];
}

export interface CouponCodeConfig {
  enabled: boolean;
  coupons: Coupon[];
}

export interface LoyaltyCardConfig {
  enabled: boolean;
  stampsRequired: number;
  rewardType: 'percentage' | 'flat';
  rewardValue: number;
}

export interface HappyHourConfig {
  enabled: boolean;
  startTime: string;
  endTime: string;
  discountPercentage: number;
  applicableDays: number[];
}

export interface DiscountConfig {
  _id?: string;
  shopId: string;
  spinWheel: SpinWheelConfig;
  scratchCard: ScratchCardConfig;
  couponCode: CouponCodeConfig;
  loyaltyCard: LoyaltyCardConfig;
  happyHour: HappyHourConfig;
  createdAt?: string;
  updatedAt?: string;
}

export interface DiscountReward {
  _id: string;
  shopId: string;
  deviceId: string;
  type: 'spin_win' | 'scratch_card' | 'loyalty' | 'loyalty_progress';
  label?: string;
  rewardType?: 'percentage' | 'flat' | 'freeItem';
  rewardValue?: number;
  status: 'available' | 'redeemed' | 'expired';
  redeemedAt?: string;
  billId?: string;
  expiresAt?: string;
  currentStamps?: number;
  stampsRequired?: number;
  createdAt: string;
}

export interface SpinResult {
  rewardId: string;
  label: string;
  rewardType: string;
  rewardValue: number;
}

export interface ScratchResult {
  rewardId: string;
  label: string;
  rewardType: string;
  rewardValue: number;
  expiresAt: string;
}

export interface CouponValidation {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  discountAmount: number;
  message: string;
}

export interface LoyaltyProgress {
  currentStamps: number;
  stampsRequired?: number;
}

export interface ActiveDiscounts {
  spinWheel?: { enabled: boolean; segments: { label: string; rewardType: string; rewardValue: number }[] };
  scratchCard?: { enabled: boolean; rewards: { label: string; rewardType: string; rewardValue: number }[] };
  couponCode?: { enabled: boolean };
  loyaltyCard?: { enabled: boolean; stampsRequired: number; rewardType: string; rewardValue: number };
  happyHour?: { enabled: boolean; startTime: string; endTime: string; discountPercentage: number; applicableDays: number[] };
}
