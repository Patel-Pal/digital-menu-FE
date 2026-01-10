# Authentication Flow Implementation

## Flow Summary
1. **Landing Page**: `/menu` (public, no login required)
2. **Registration**: Store user in DB with role
3. **Login**: Check credentials in DB
4. **Role-based Dashboard**: Redirect based on user role
5. **Protected Routes**: Admin/Shopkeeper routes require login

## Files Created

### 1. ProtectedRoute Component
- `src/components/ProtectedRoute.tsx`
- Protects admin and shopkeeper routes
- Redirects to login if not authenticated

### 2. Updated Authentication Pages
- `src/pages/auth/LoginPageUpdated.tsx`
- `src/pages/auth/RegisterPageUpdated.tsx`
- Real API integration with role-based navigation

### 3. Updated App Structure
- `src/AppUpdated.tsx`
- Protected routes for admin/shopkeeper
- Public menu page as landing

## Quick Implementation

### Step 1: Replace App.tsx
```bash
# Backup current App.tsx
mv src/App.tsx src/App.backup.tsx

# Use updated version
mv src/AppUpdated.tsx src/App.tsx
```

### Step 2: Replace Auth Pages
```bash
# Backup and replace login page
mv src/pages/auth/LoginPage.tsx src/pages/auth/LoginPage.backup.tsx
mv src/pages/auth/LoginPageUpdated.tsx src/pages/auth/LoginPage.tsx

# Backup and replace register page
mv src/pages/auth/RegisterPage.tsx src/pages/auth/RegisterPage.backup.tsx
mv src/pages/auth/RegisterPageUpdated.tsx src/pages/auth/RegisterPage.tsx
```

### Step 3: Test the Flow

1. **Start Backend**:
   ```bash
   cd digital-menu-BE
   node server.js
   ```

2. **Start Frontend**:
   ```bash
   cd digital-menu-FE
   npm run dev
   ```

3. **Test Flow**:
   - Visit `http://localhost:8080` → Redirects to `/menu` (public)
   - Try to access `/admin` → Redirects to login
   - Try to access `/shop` → Redirects to login
   - Register new user → Stores in DB → Role-based redirect
   - Login existing user → Check DB → Role-based redirect

## Authentication Rules

### Public Routes (No Login Required)
- `/menu` - Landing page
- `/menu/:shopId` - Specific shop menu
- `/auth/login` - Login page
- `/auth/register` - Registration page

### Protected Routes (Login Required)
- `/admin/*` - Admin only
- `/shop/*` - Shopkeeper only

### Role-based Navigation After Login/Register
- **Admin** → `/admin`
- **Shopkeeper** → `/shop`
- **Customer** → `/menu`

## Backend Requirements

Make sure your backend is running with:
- MongoDB connected
- User registration endpoint working
- User login endpoint working
- JWT token generation working

The frontend will automatically:
- Store JWT tokens
- Add tokens to API requests
- Handle token expiration
- Redirect on authentication errors
