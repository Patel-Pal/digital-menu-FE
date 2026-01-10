import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuService } from '@/services';
import { toast } from 'sonner';

export const useMenu = (shopId: string) => {
  return useQuery({
    queryKey: ['menu', shopId],
    queryFn: () => menuService.getMenuByShop(shopId),
    enabled: !!shopId,
  });
};

export const useCreateMenu = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: menuService.createOrUpdateMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Menu saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save menu');
    },
  });
};

export const useAddMenuItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ menuId, item }: { menuId: string; item: any }) => 
      menuService.addMenuItem(menuId, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Menu item added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add menu item');
    },
  });
};

export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ menuId, itemId, item }: { menuId: string; itemId: string; item: any }) => 
      menuService.updateMenuItem(menuId, itemId, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Menu item updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update menu item');
    },
  });
};
