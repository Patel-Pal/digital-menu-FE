import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services';

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminService.getDashboardStats(),
  });
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminService.getAllUsers(),
  });
};
