import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopService } from '@/services';
import { toast } from 'sonner';

export const useShops = () => {
  return useQuery({
    queryKey: ['shops'],
    queryFn: () => shopService.getShops(),
  });
};

export const useShop = (id: string) => {
  return useQuery({
    queryKey: ['shop', id],
    queryFn: () => shopService.getShop(id),
    enabled: !!id,
  });
};

export const useCreateShop = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: shopService.createShop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      toast.success('Shop created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create shop');
    },
  });
};

export const useUpdateShop = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      shopService.updateShop(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      toast.success('Shop updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update shop');
    },
  });
};
