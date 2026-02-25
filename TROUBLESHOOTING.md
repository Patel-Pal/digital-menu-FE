# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 1. Socket.IO Client Error

**Error:**
```
Failed to resolve import "socket.io-client" from "src/hooks/useWebSocket.ts"
```

**Solution:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Reinstall dependencies
npm install

# Restart dev server
npm run dev
```

### 2. Browserslist Warning

**Warning:**
```
Browserslist: browsers data (caniuse-lite) is 8 months old
```

**Solution (Optional):**
```bash
# Update browserslist database
npx browserslist@latest --update-db
```

This warning is not critical and won't affect functionality.

### 3. Module Not Found Errors

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### 4. Port Already in Use

**Error:**
```
Port 8080 is already in use
```

**Solution:**
```bash
# Kill process on port 8080 (Windows)
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Or change port in vite.config.ts
server: {
  port: 8081
}
```

### 5. API Connection Issues

**Error:**
```
Network Error / CORS Error
```

**Solution:**
1. Verify backend is running: `http://localhost:5000`
2. Check `.env` file has correct API URL:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
3. Restart both servers

### 6. TypeScript Errors

**Error:**
```
Type errors in components
```

**Solution:**
```bash
# Check TypeScript configuration
npx tsc --noEmit

# If needed, update tsconfig.json
```

### 7. Build Errors

**Error:**
```
Build failed
```

**Solution:**
```bash
# Clear cache and rebuild
rm -rf node_modules/.vite dist
npm run build
```

### 8. Hot Reload Not Working

**Solution:**
```bash
# Restart dev server
# Press Ctrl+C to stop
npm run dev
```

### 9. Email Not Sending (Backend)

**Solution:**
1. Check `.env` email configuration
2. Verify Gmail App Password is correct
3. Test SMTP connection:
   ```bash
   node test-forgot-password.js
   ```

### 10. Database Connection Issues

**Solution:**
1. Verify MongoDB is running
2. Check connection string in `.env`
3. Check network connectivity

---

## Quick Fixes

### Reset Everything
```bash
# Frontend
cd digital-menu-builder
rm -rf node_modules package-lock.json .vite dist
npm install
npm run dev

# Backend
cd Digital-Menu-BE
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Check Versions
```bash
node --version    # Should be v18+
npm --version     # Should be v9+
```

### Verify Installation
```bash
# Frontend
npm list socket.io-client
npm list react
npm list vite

# Backend
npm list nodemailer
npm list express
npm list mongoose
```

---

## Getting Help

1. Check server logs for errors
2. Check browser console for errors
3. Verify environment variables are loaded
4. Test API endpoints with curl/Postman
5. Review documentation files

---

## Useful Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter

# Backend
npm run dev          # Start with nodemon
npm start            # Start production server
node test-forgot-password.js  # Test forgot password
```

---

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/digital-menu
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

---

## Still Having Issues?

1. Check all documentation files
2. Review error messages carefully
3. Verify all dependencies are installed
4. Ensure both servers are running
5. Check firewall/antivirus settings
