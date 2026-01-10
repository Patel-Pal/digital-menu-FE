# API Integration Guide

## Overview
This document explains how to integrate the backend API with your existing frontend components.

## Structure Created

### Services (`src/services/`)
- `api.ts` - Axios configuration with interceptors
- `authService.ts` - Authentication API calls
- `shopService.ts` - Shop management API calls
- `menuService.ts` - Menu management API calls
- `adminService.ts` - Admin panel API calls

### Hooks (`src/hooks/`)
- `useShops.ts` - React Query hooks for shop operations
- `useMenu.ts` - React Query hooks for menu operations
- `useAdmin.ts` - React Query hooks for admin operations

### Context (`src/contexts/`)
- `AuthContext.tsx` - Authentication state management

## Usage Examples

### 1. Authentication
```tsx
import { useAuth } from '@/contexts/AuthContext';

const { user, login, logout } = useAuth();

// Login
await login(email, password);

// Logout
logout();
```

### 2. Fetching Data
```tsx
import { useMenu } from '@/hooks/useMenu';

const { data: menuData, isLoading, error } = useMenu(shopId);
```

### 3. Mutations
```tsx
import { useCreateShop } from '@/hooks/useShops';

const createShop = useCreateShop();

await createShop.mutateAsync({
  name: "My Restaurant",
  description: "Great food"
});
```

## Integration Steps

### Step 1: Install Dependencies
```bash
npm install axios
```

### Step 2: Set Environment Variables
Create `.env` file:
```
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Wrap App with Providers
```tsx
// In App.tsx
import { AuthProvider } from '@/contexts/AuthContext';

<QueryClientProvider client={queryClient}>
  <AuthProvider>
    <ThemeProvider>
      {/* Your app */}
    </ThemeProvider>
  </AuthProvider>
</QueryClientProvider>
```

### Step 4: Replace Mock Data
Replace existing mock data usage with API calls:

```tsx
// Before (using mock data)
import { mockMenuItems } from '@/utils/mockData';

// After (using API)
import { useMenu } from '@/hooks/useMenu';
const { data: menuData } = useMenu(shopId);
const items = menuData?.data?.items || [];
```

## Example Files Created

1. `LoginPageWithAPI.tsx` - Shows how to integrate login with API
2. `CustomerMenuPageWithAPI.tsx` - Shows how to fetch and display menu data
3. `MenuManagementPageWithAPI.tsx` - Shows how to manage menu items with API

## Key Features

### Automatic Token Management
- Tokens are automatically added to requests
- Automatic logout on 401 errors
- Token stored in localStorage

### Error Handling
- Consistent error handling across all services
- Toast notifications for success/error states
- Loading states for better UX

### Type Safety
- Full TypeScript support
- Proper typing for all API responses
- Type-safe hooks and services

## Next Steps

1. Replace existing pages with API-integrated versions
2. Add proper error boundaries
3. Implement optimistic updates where appropriate
4. Add offline support if needed

## Notes

- The existing design and UI components remain unchanged
- All API integration is additive - no breaking changes
- Mock data can be gradually replaced with real API calls
- Authentication state is managed globally via context
