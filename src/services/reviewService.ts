import api from './api';

export interface Review {
  _id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
  data: Review[];
}

export const reviewService = {
  getReviews: async (shopId: string, page = 1, limit = 10): Promise<ReviewStats> => {
    const res = await api.get(`/reviews/${shopId}?page=${page}&limit=${limit}`);
    return res.data;
  },

  submitReview: async (shopId: string, payload: {
    rating: number;
    comment?: string;
    customerName?: string;
    deviceId: string;
  }) => {
    const res = await api.post(`/reviews/${shopId}`, payload);
    return res.data;
  },

  checkReview: async (shopId: string, deviceId: string) => {
    const res = await api.get(`/reviews/${shopId}/check/${deviceId}`);
    return res.data;
  },

  deleteReview: async (reviewId: string) => {
    const res = await api.delete(`/reviews/${reviewId}`);
    return res.data;
  }
};
