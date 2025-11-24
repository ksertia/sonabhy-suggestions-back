# Auth Module - Quick Reference

Fast reference guide for the authentication module.

## 🚀 Quick Start

### 1. Register a User
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstname": "John",
  "lastname": "Doe"
}
```

### 2. Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### 3. Access Protected Route
```bash
GET /api/v1/auth/profile
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 4. Refresh Token
```bash
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

### 5. Logout
```bash
POST /api/v1/auth/logout
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

---

## 📋 Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/auth/register` | POST | ❌ | Register new user |
| `/api/v1/auth/login` | POST | ❌ | Login user |
| `/api/v1/auth/refresh` | POST | ❌ | Refresh access token |
| `/api/v1/auth/logout` | POST | ❌ | Logout user |
| `/api/v1/auth/profile` | GET | ✅ | Get user profile |

---

## 🔑 Middleware Usage

### Protect a Route (Authentication)
```javascript
const { authenticate } = require('../middleware/auth.middleware');

router.get('/protected', authenticate, (req, res) => {
  // req.user is available
  res.json({ user: req.user });
});
```

### Protect by Role (Authorization)
```javascript
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

// Only ADMIN
router.delete('/users/:id', 
  authenticate, 
  authorize('ADMIN'), 
  deleteUser
);

// ADMIN or MANAGER
router.get('/reports', 
  authenticate, 
  authorize('ADMIN', 'MANAGER'), 
  getReports
);

// Any authenticated user
router.get('/profile', 
  authenticate, 
  getProfile
);
```

---

## 🎭 Roles

| Role | Level | Description |
|------|-------|-------------|
| `USER` | 1 | Basic user access |
| `MANAGER` | 2 | Elevated permissions |
| `ADMIN` | 3 | Full system access |

---

## 🔐 Password Requirements

- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)

**Valid Examples:**
- `SecurePass123`
- `MyPassword1`
- `Admin@2024`

**Invalid Examples:**
- `password` (no uppercase, no number)
- `PASSWORD123` (no lowercase)
- `Pass123` (too short)

---

## 🎫 Token Information

### Access Token
- **Expiration:** 15 minutes
- **Algorithm:** HS256
- **Payload:** `{ userId, role }`
- **Usage:** Include in `Authorization: Bearer <token>` header

### Refresh Token
- **Expiration:** 7 days
- **Algorithm:** HS256
- **Payload:** `{ userId }`
- **Storage:** Database (can be invalidated)
- **Usage:** Send in request body to refresh endpoint

---

## 📦 Request/Response Examples

### Register Request
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstname": "John",
  "lastname": "Doe",
  "role": "USER"
}
```

### Register Response (201)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstname": "John",
      "lastname": "Doe",
      "role": "USER",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Login Request
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### Login Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user object */ },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

---

## ⚠️ Common Errors

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

## 🧪 Test Accounts

After running `npm run prisma:seed`:

```
┌─────────┬──────────────────────┬──────────────┬────────┐
│ Role    │ Email                │ Password     │ Access │
├─────────┼──────────────────────┼──────────────┼────────┤
│ ADMIN   │ admin@ideabox.com    │ Admin@123    │ Full   │
│ MANAGER │ manager@ideabox.com  │ Manager@123  │ High   │
│ USER    │ user@ideabox.com     │ User@123     │ Basic  │
└─────────┴──────────────────────┴──────────────┴────────┘
```

---

## 💻 Code Snippets

### JavaScript Client

```javascript
class AuthClient {
  constructor(baseURL = 'http://localhost:3000/api/v1/auth') {
    this.baseURL = baseURL;
  }

  async register(email, password, firstname, lastname) {
    const response = await fetch(`${this.baseURL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstname, lastname }),
    });
    return await response.json();
  }

  async login(email, password) {
    const response = await fetch(`${this.baseURL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    
    // Store tokens
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    
    return data;
  }

  async getProfile() {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${this.baseURL}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return await response.json();
  }

  async refresh() {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch(`${this.baseURL}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await response.json();
    
    // Update access token
    localStorage.setItem('accessToken', data.data.accessToken);
    
    return data;
  }

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    await fetch(`${this.baseURL}/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    
    // Clear tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

// Usage
const auth = new AuthClient();
await auth.login('user@example.com', 'SecurePass123');
const profile = await auth.getProfile();
```

### Express Route Protection

```javascript
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

// Public route
router.get('/public', (req, res) => {
  res.json({ message: 'Public data' });
});

// Protected route (any authenticated user)
router.get('/protected', authenticate, (req, res) => {
  res.json({ 
    message: 'Protected data',
    user: req.user 
  });
});

// Admin only
router.delete('/admin-only', 
  authenticate, 
  authorize('ADMIN'), 
  (req, res) => {
    res.json({ message: 'Admin action completed' });
  }
);

// Admin or Manager
router.post('/managers', 
  authenticate, 
  authorize('ADMIN', 'MANAGER'), 
  (req, res) => {
    res.json({ message: 'Manager action completed' });
  }
);

module.exports = router;
```

---

## 🔧 Environment Variables

```env
# Required
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# Optional (defaults shown)
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

---

## 📊 Authentication Flow

```
┌─────────┐
│ Client  │
└────┬────┘
     │
     │ 1. POST /register or /login
     ▼
┌─────────────────┐
│  Auth Service   │
└────┬────────────┘
     │
     │ 2. Validate & Hash Password
     ▼
┌─────────────────┐
│   Database      │
└────┬────────────┘
     │
     │ 3. Create User & Tokens
     ▼
┌─────────────────┐
│  Auth Service   │
└────┬────────────┘
     │
     │ 4. Return Tokens
     ▼
┌─────────┐
│ Client  │ Store tokens
└─────────┘

     │
     │ 5. GET /protected (with token)
     ▼
┌─────────────────┐
│  Auth Middleware│
└────┬────────────┘
     │
     │ 6. Verify Token
     ▼
┌─────────────────┐
│  Route Handler  │
└────┬────────────┘
     │
     │ 7. Return Data
     ▼
┌─────────┐
│ Client  │
└─────────┘
```

---

## 🎯 Common Use Cases

### 1. User Registration Flow
```javascript
// 1. Register
const { data } = await auth.register(
  'user@example.com', 
  'SecurePass123',
  'John',
  'Doe'
);

// 2. Store tokens
localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);

// 3. Redirect to dashboard
window.location.href = '/dashboard';
```

### 2. Login Flow
```javascript
// 1. Login
const { data } = await auth.login('user@example.com', 'SecurePass123');

// 2. Store tokens
localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);

// 3. Load user profile
const profile = await auth.getProfile();
```

### 3. Token Refresh Flow
```javascript
// Intercept 401 errors and refresh token
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('accessToken');
  
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
  
  // If 401, try to refresh
  if (response.status === 401) {
    await auth.refresh();
    
    // Retry with new token
    const newToken = localStorage.getItem('accessToken');
    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${newToken}`,
      },
    });
  }
  
  return response;
}
```

### 4. Logout Flow
```javascript
// 1. Call logout endpoint
await auth.logout();

// 2. Clear local state
localStorage.clear();

// 3. Redirect to login
window.location.href = '/login';
```

---

## 🔍 Debugging

### Check Token Expiration
```javascript
function isTokenExpired(token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return Date.now() >= payload.exp * 1000;
}

const token = localStorage.getItem('accessToken');
if (isTokenExpired(token)) {
  console.log('Token expired, refreshing...');
  await auth.refresh();
}
```

### Decode Token
```javascript
function decodeToken(token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('User ID:', payload.userId);
  console.log('Role:', payload.role);
  console.log('Expires:', new Date(payload.exp * 1000));
}
```

---

## 📚 Related Documentation

- [Full Auth Module Documentation](./AUTH_MODULE.md)
- [API Examples](./API_EXAMPLES.md)
- [Schema Documentation](./SCHEMA_DOCUMENTATION.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)

---

**Last Updated:** 2024
**Version:** 2.0.0
