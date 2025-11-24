# Authentication Module Documentation

Complete guide to the Express.js Authentication module with JWT, bcrypt, and role-based access control.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Middleware](#middleware)
- [Security](#security)
- [Usage Examples](#usage-examples)
- [Testing](#testing)

---

## 🎯 Overview

The authentication module provides a complete JWT-based authentication system with:
- User registration and login
- Access token (short-lived) + Refresh token (long-lived)
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Token refresh mechanism
- Secure logout

### Tech Stack
- **Express.js** - Web framework
- **Prisma** - ORM for database operations
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token generation/verification
- **Zod** - Request validation
- **Swagger** - API documentation

---

## ✨ Features

### ✅ User Registration
- Email validation
- Strong password requirements
- Password hashing (bcrypt, 10 rounds)
- Automatic token generation
- Role assignment (USER by default)

### ✅ User Login
- Credential verification
- Account status check
- Token generation
- Refresh token storage

### ✅ Token Management
- **Access Token**: 15 minutes expiration
- **Refresh Token**: 7 days expiration
- Token refresh endpoint
- Secure token storage in database

### ✅ Logout
- Refresh token invalidation
- Secure session termination

### ✅ Role-Based Access Control
- **USER** - Basic access
- **MANAGER** - Elevated permissions
- **ADMIN** - Full access

### ✅ Security Features
- Password hashing with bcrypt
- JWT token signing (HS256)
- Token expiration
- Account activation status
- Protected routes

---

## 🏗️ Architecture

### Module Structure

```
src/modules/auth/
├── auth.repository.js    # Database operations
├── auth.service.js       # Business logic
├── auth.controller.js    # HTTP request handlers
├── auth.routes.js        # Route definitions
└── auth.validation.js    # Request validation schemas
```

### Layer Responsibilities

```
┌─────────────────────────────────────────────┐
│           HTTP Request                      │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         auth.routes.js                      │
│  - Route definitions                        │
│  - Middleware application                   │
│  - Swagger documentation                    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│      validation.middleware.js               │
│  - Zod schema validation                    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│       auth.controller.js                    │
│  - Request/response handling                │
│  - Error handling                           │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│        auth.service.js                      │
│  - Business logic                           │
│  - Password hashing                         │
│  - Token generation                         │
│  - Validation                               │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│      auth.repository.js                     │
│  - Database queries (Prisma)                │
│  - User CRUD operations                     │
│  - Token management                         │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│          PostgreSQL Database                │
│  - users table                              │
│  - refresh_tokens table                     │
└─────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints

### Base URL
```
/api/v1/auth
```

### Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | Login user |
| POST | `/refresh` | No | Refresh access token |
| POST | `/logout` | No | Logout user |
| GET | `/profile` | Yes | Get user profile |

---

## 📝 Detailed Endpoint Documentation

### 1. Register User

**POST** `/api/v1/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstname": "John",
  "lastname": "Doe",
  "role": "USER"
}
```

**Validation Rules:**
- `email`: Valid email format
- `password`: 
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- `firstname`: 1-50 characters
- `lastname`: 1-50 characters
- `role`: USER | MANAGER | ADMIN (optional, defaults to USER)

**Success Response (201):**
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
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `409 Conflict` - Email already exists
- `400 Bad Request` - Validation error

---

### 2. Login User

**POST** `/api/v1/auth/login`

Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
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
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `401 Unauthorized` - Account is inactive

---

### 3. Refresh Token

**POST** `/api/v1/auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstname": "John",
      "lastname": "Doe",
      "role": "USER",
      "isActive": true
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid refresh token
- `401 Unauthorized` - Refresh token expired
- `401 Unauthorized` - Account is inactive

---

### 4. Logout

**POST** `/api/v1/auth/logout`

Invalidate refresh token and logout user.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

### 5. Get Profile

**GET** `/api/v1/auth/profile`

Get authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
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
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized` - No token provided
- `401 Unauthorized` - Invalid token
- `401 Unauthorized` - User not found

---

## 🔐 Authentication Flow

### Registration Flow

```
1. User submits registration form
   ↓
2. Validate request data (Zod)
   ↓
3. Check if email already exists
   ↓
4. Hash password (bcrypt, 10 rounds)
   ↓
5. Create user in database
   ↓
6. Generate access token (15 min)
   ↓
7. Generate refresh token (7 days)
   ↓
8. Store refresh token in database
   ↓
9. Return user data + tokens
```

### Login Flow

```
1. User submits credentials
   ↓
2. Validate request data
   ↓
3. Find user by email
   ↓
4. Verify password (bcrypt.compare)
   ↓
5. Check if account is active
   ↓
6. Generate access token
   ↓
7. Generate refresh token
   ↓
8. Store refresh token in database
   ↓
9. Return user data + tokens
```

### Token Refresh Flow

```
1. Client sends refresh token
   ↓
2. Verify refresh token (JWT)
   ↓
3. Check token exists in database
   ↓
4. Check token not expired
   ↓
5. Check user is active
   ↓
6. Generate new access token
   ↓
7. Return new access token + user data
```

### Protected Route Flow

```
1. Client sends request with access token
   ↓
2. Extract token from Authorization header
   ↓
3. Verify token signature (JWT)
   ↓
4. Check token not expired
   ↓
5. Load user from database
   ↓
6. Check user exists and is active
   ↓
7. Attach user to request object
   ↓
8. Continue to route handler
```

---

## 🛡️ Middleware

### 1. Authentication Middleware (authGuard)

**File:** `src/middleware/auth.middleware.js`

Verifies JWT access token and loads user.

**Usage:**
```javascript
const { authenticate } = require('../middleware/auth.middleware');

router.get('/protected', authenticate, (req, res) => {
  // req.user is available here
  res.json({ user: req.user });
});
```

**What it does:**
1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies token signature and expiration
3. Loads user from database
4. Checks user is active
5. Attaches user to `req.user`

**User Object:**
```javascript
req.user = {
  id: "uuid",
  email: "user@example.com",
  firstname: "John",
  lastname: "Doe",
  role: "USER",
  isActive: true
}
```

---

### 2. Role-Based Access Control (roleGuard)

**File:** `src/middleware/rbac.middleware.js`

Restricts access based on user roles.

**Usage:**
```javascript
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

// Only ADMIN can access
router.delete('/users/:id', 
  authenticate, 
  authorize('ADMIN'), 
  deleteUser
);

// ADMIN or MANAGER can access
router.get('/reports', 
  authenticate, 
  authorize('ADMIN', 'MANAGER'), 
  getReports
);
```

**What it does:**
1. Checks if user is authenticated
2. Checks if user's role is in allowed roles
3. Throws ForbiddenError if not authorized

---

### 3. Validation Middleware

**File:** `src/middleware/validation.middleware.js`

Validates request data using Zod schemas.

**Usage:**
```javascript
const { validate } = require('../middleware/validation.middleware');
const { registerSchema } = require('./auth.validation');

router.post('/register', 
  validate(registerSchema), 
  authController.register
);
```

**What it does:**
1. Validates request body, query, params against schema
2. Returns 400 error with details if validation fails
3. Continues to next middleware if valid

---

## 🔒 Security

### Password Security

**Hashing:**
- Algorithm: bcrypt
- Salt rounds: 10
- Never store plain text passwords
- Password never returned in API responses

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Token Security

**Access Token:**
- Algorithm: HS256 (HMAC with SHA-256)
- Expiration: 15 minutes
- Payload: `{ userId, role }`
- Secret: From environment variable

**Refresh Token:**
- Algorithm: HS256
- Expiration: 7 days
- Payload: `{ userId }`
- Stored in database
- Can be invalidated on logout
- Secret: From environment variable (different from access token)

**Best Practices:**
- Use HTTPS in production
- Store tokens securely on client (httpOnly cookies recommended)
- Implement token rotation
- Clear tokens on logout
- Validate token on every request

### Environment Variables

```env
# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-token-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

**⚠️ Important:**
- Use strong, random secrets in production
- Never commit secrets to version control
- Rotate secrets periodically
- Use different secrets for access and refresh tokens

---

## 💻 Usage Examples

### JavaScript (Fetch API)

```javascript
// Register
const register = async () => {
  const response = await fetch('http://localhost:3000/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'SecurePass123',
      firstname: 'John',
      lastname: 'Doe',
    }),
  });
  
  const data = await response.json();
  
  // Store tokens
  localStorage.setItem('accessToken', data.data.accessToken);
  localStorage.setItem('refreshToken', data.data.refreshToken);
  
  return data;
};

// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  // Store tokens
  localStorage.setItem('accessToken', data.data.accessToken);
  localStorage.setItem('refreshToken', data.data.refreshToken);
  
  return data;
};

// Get Profile (Protected)
const getProfile = async () => {
  const accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:3000/api/v1/auth/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  return await response.json();
};

// Refresh Token
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('http://localhost:3000/api/v1/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });
  
  const data = await response.json();
  
  // Update access token
  localStorage.setItem('accessToken', data.data.accessToken);
  
  return data;
};

// Logout
const logout = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  await fetch('http://localhost:3000/api/v1/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });
  
  // Clear tokens
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};
```

### cURL Examples

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "firstname": "John",
    "lastname": "Doe"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'

# Get Profile
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Refresh Token
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'

# Logout
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## 🧪 Testing

### Manual Testing

1. **Start the server:**
```bash
npm run dev
```

2. **Test registration:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "firstname": "Test",
    "lastname": "User"
  }'
```

3. **Test login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

4. **Test protected route:**
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test Accounts

After running `npm run prisma:seed`:

```
Admin:
  Email: admin@ideabox.com
  Password: Admin@123
  Role: ADMIN

Manager:
  Email: manager@ideabox.com
  Password: Manager@123
  Role: MANAGER

User:
  Email: user@ideabox.com
  Password: User@123
  Role: USER
```

---

## 📊 Database Schema

### User Table

```prisma
model User {
  id            String         @id @default(uuid())
  firstname     String
  lastname      String
  email         String         @unique
  password      String
  role          Role           @default(USER)
  isActive      Boolean        @default(true)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  
  refreshTokens RefreshToken[]
}
```

### RefreshToken Table

```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 🔧 Configuration

### JWT Configuration

**File:** `src/utils/jwt.js`

```javascript
const jwt = require('jsonwebtoken');

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
  });
};
```

### Environment Variables

```env
# JWT Configuration
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

---

## 🚀 Best Practices

1. **Always use HTTPS in production**
2. **Store tokens securely** (httpOnly cookies preferred)
3. **Implement token rotation** for refresh tokens
4. **Use strong JWT secrets** (minimum 32 characters)
5. **Validate all inputs** with Zod schemas
6. **Hash passwords** with bcrypt (never store plain text)
7. **Implement rate limiting** on auth endpoints
8. **Log authentication events** for security auditing
9. **Use environment variables** for configuration
10. **Implement account lockout** after failed attempts

---

## 📚 Additional Resources

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [Prisma Documentation](https://www.prisma.io/docs)

---

**Last Updated:** 2024
**Module Version:** 2.0.0
