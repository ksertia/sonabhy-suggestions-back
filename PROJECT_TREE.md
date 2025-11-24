# Project Directory Tree

Complete visual representation of the project structure.

```
idea-box-backend/
│
├── 📄 Configuration Files
│   ├── .env.example                    # Environment variables template
│   ├── .gitignore                      # Git ignore rules
│   └── package.json                    # Dependencies and scripts
│
├── 📚 Documentation
│   ├── README.md                       # Main project documentation
│   ├── SETUP.md                        # Detailed setup guide
│   ├── QUICKSTART.md                   # 5-minute quick start
│   ├── ARCHITECTURE.md                 # Architecture documentation
│   ├── API_EXAMPLES.md                 # API usage examples
│   ├── PROJECT_SUMMARY.md              # Project overview
│   ├── DEPLOYMENT_CHECKLIST.md         # Production deployment guide
│   └── PROJECT_TREE.md                 # This file
│
├── 🗄️ prisma/
│   ├── schema.prisma                   # Database schema definition
│   │   ├── User model
│   │   ├── RefreshToken model
│   │   └── File model
│   └── seed.js                         # Database seeding script
│
├── 💻 src/
│   │
│   ├── 🔧 config/
│   │   ├── database.js                 # Prisma client configuration
│   │   └── swagger.js                  # Swagger/OpenAPI setup
│   │
│   ├── 📦 modules/
│   │   │
│   │   ├── 🔐 auth/                    # Authentication Module
│   │   │   ├── auth.controller.js      # HTTP request handlers
│   │   │   ├── auth.service.js         # Business logic
│   │   │   ├── auth.repository.js      # Database operations
│   │   │   ├── auth.routes.js          # Route definitions
│   │   │   └── auth.validation.js      # Request validation schemas
│   │   │
│   │   ├── 👥 users/                   # User Management Module
│   │   │   ├── user.controller.js      # HTTP request handlers
│   │   │   ├── user.service.js         # Business logic
│   │   │   ├── user.repository.js      # Database operations
│   │   │   ├── user.routes.js          # Route definitions
│   │   │   └── user.validation.js      # Request validation schemas
│   │   │
│   │   └── 📁 files/                   # File Upload Module
│   │       ├── file.controller.js      # HTTP request handlers
│   │       ├── file.service.js         # Business logic
│   │       ├── file.repository.js      # Database operations
│   │       ├── file.routes.js          # Route definitions
│   │       └── file.validation.js      # Request validation schemas
│   │
│   ├── 🛡️ middleware/
│   │   ├── auth.middleware.js          # JWT authentication
│   │   ├── rbac.middleware.js          # Role-based access control
│   │   ├── error.middleware.js         # Global error handler
│   │   ├── validation.middleware.js    # Request validation
│   │   └── upload.middleware.js        # File upload handling (Multer)
│   │
│   ├── 🔨 utils/
│   │   ├── errors.js                   # Custom error classes
│   │   ├── jwt.js                      # JWT utilities
│   │   └── response.js                 # Response helpers
│   │
│   ├── app.js                          # Express application setup
│   └── index.js                        # Server entry point
│
└── 📂 uploads/                         # File storage directory (auto-created)
    └── [uploaded files]
```

## Detailed Module Breakdown

### 🔐 Authentication Module (`src/modules/auth/`)

**Purpose:** Handle user authentication and token management

**Files:**
- `auth.controller.js` - Endpoints: register, login, refresh, logout, profile
- `auth.service.js` - Business logic for authentication
- `auth.repository.js` - Database queries for users and tokens
- `auth.routes.js` - Route definitions with Swagger docs
- `auth.validation.js` - Zod schemas for request validation

**Key Features:**
- User registration with password hashing
- Login with JWT token generation
- Access token refresh mechanism
- Logout with token invalidation
- Profile retrieval

---

### 👥 User Management Module (`src/modules/users/`)

**Purpose:** Manage user accounts and profiles

**Files:**
- `user.controller.js` - Endpoints: list, get, update, delete users
- `user.service.js` - Business logic for user operations
- `user.repository.js` - Database queries for user data
- `user.routes.js` - Route definitions with Swagger docs
- `user.validation.js` - Zod schemas for request validation

**Key Features:**
- List all users (Admin only)
- Get user by ID
- Update user profile
- Delete user (Admin only)
- Pagination support

---

### 📁 File Upload Module (`src/modules/files/`)

**Purpose:** Handle file uploads and downloads

**Files:**
- `file.controller.js` - Endpoints: upload, list, get, download, delete
- `file.service.js` - Business logic for file operations
- `file.repository.js` - Database queries for file metadata
- `file.routes.js` - Route definitions with Swagger docs
- `file.validation.js` - Zod schemas for request validation

**Key Features:**
- File upload with validation
- File metadata storage
- File download
- File deletion with cleanup
- Role-based file access

---

## Middleware Stack

### 🛡️ Middleware (`src/middleware/`)

**Execution Order:**
1. CORS
2. Helmet (security headers)
3. Body parser
4. Morgan (logging)
5. Authentication (if protected route)
6. Authorization/RBAC (if role-restricted)
7. Validation (request validation)
8. Upload (if file upload)
9. Route handler
10. Error handler

**Files:**
- `auth.middleware.js` - Verify JWT and attach user to request
- `rbac.middleware.js` - Check user role permissions
- `error.middleware.js` - Catch and format errors
- `validation.middleware.js` - Validate requests with Zod
- `upload.middleware.js` - Handle file uploads with Multer

---

## Utilities

### 🔨 Utils (`src/utils/`)

**errors.js** - Custom Error Classes:
- `AppError` - Base error class
- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `ValidationError` (422)

**jwt.js** - JWT Functions:
- `generateAccessToken()`
- `generateRefreshToken()`
- `verifyAccessToken()`
- `verifyRefreshToken()`
- `decodeToken()`

**response.js** - Response Helpers:
- `successResponse()` - Format success responses
- `errorResponse()` - Format error responses

---

## Database Models

### 🗄️ Prisma Schema (`prisma/schema.prisma`)

**User Model:**
```prisma
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  password      String
  firstName     String
  lastName      String
  role          Role           @default(USER)
  isActive      Boolean        @default(true)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  refreshTokens RefreshToken[]
  files         File[]
}
```

**RefreshToken Model:**
```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

**File Model:**
```prisma
model File {
  id           String   @id @default(uuid())
  originalName String
  filename     String   @unique
  mimetype     String
  size         Int
  path         String
  uploadedById String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  uploadedBy   User     @relation(fields: [uploadedById], references: [id])
}
```

---

## API Routes

### 🌐 Route Structure

```
http://localhost:3000
│
├── /health                             # Health check
├── /api-docs                           # Swagger UI
│
└── /api/v1/
    │
    ├── /auth/
    │   ├── POST   /register            # Register user
    │   ├── POST   /login               # Login user
    │   ├── POST   /refresh             # Refresh token
    │   ├── POST   /logout              # Logout user
    │   └── GET    /profile             # Get profile (protected)
    │
    ├── /users/
    │   ├── GET    /                    # List users (Admin, protected)
    │   ├── GET    /:id                 # Get user (protected)
    │   ├── PUT    /:id                 # Update user (protected)
    │   └── DELETE /:id                 # Delete user (Admin, protected)
    │
    └── /files/
        ├── POST   /upload              # Upload file (protected)
        ├── GET    /                    # List files (protected)
        ├── GET    /:id                 # Get file (protected)
        ├── GET    /:id/download        # Download file (protected)
        └── DELETE /:id                 # Delete file (protected)
```

---

## File Counts

```
📊 Project Statistics:

Configuration Files:     3
Documentation Files:     8
Source Code Files:      25
  ├── Controllers:       3
  ├── Services:          3
  ├── Repositories:      3
  ├── Routes:            3
  ├── Validations:       3
  ├── Middleware:        5
  ├── Utils:             3
  └── Config:            2

Total Files:           36+
Lines of Code:      ~2,500+
```

---

## Module Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                         Express App                          │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼──────┐ ┌───▼────┐ ┌─────▼──────┐
        │ Auth Module  │ │ Users  │ │   Files    │
        └───────┬──────┘ └───┬────┘ └─────┬──────┘
                │            │            │
                └────────────┼────────────┘
                             │
                    ┌────────▼────────┐
                    │   Middleware    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │     Utils       │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │     Prisma      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL    │
                    └─────────────────┘
```

---

## Code Organization Principles

### 1. **Separation of Concerns**
Each layer has a specific responsibility:
- Controllers: HTTP handling
- Services: Business logic
- Repositories: Data access

### 2. **Modularity**
Each feature is self-contained:
- Easy to add new modules
- Easy to modify existing modules
- Clear dependencies

### 3. **Reusability**
Common functionality is extracted:
- Middleware for cross-cutting concerns
- Utils for shared functions
- Config for centralized settings

### 4. **Testability**
Structure supports testing:
- Isolated layers
- Dependency injection
- Mock-friendly design

---

## Adding a New Module

To add a new module (e.g., "posts"):

```
1. Create directory: src/modules/posts/

2. Create files:
   ├── post.controller.js
   ├── post.service.js
   ├── post.repository.js
   ├── post.routes.js
   └── post.validation.js

3. Add model to: prisma/schema.prisma

4. Register routes in: src/app.js

5. Update Swagger config if needed
```

---

## Navigation Tips

### Finding Code

**Authentication logic:**
→ `src/modules/auth/auth.service.js`

**User CRUD operations:**
→ `src/modules/users/user.service.js`

**File upload handling:**
→ `src/modules/files/file.service.js`

**JWT utilities:**
→ `src/utils/jwt.js`

**Error definitions:**
→ `src/utils/errors.js`

**Database schema:**
→ `prisma/schema.prisma`

**API documentation:**
→ `http://localhost:3000/api-docs`

---

## Quick Reference

| Need to...                    | Look in...                          |
|-------------------------------|-------------------------------------|
| Add new endpoint              | `modules/[module]/[module].routes.js` |
| Add business logic            | `modules/[module]/[module].service.js` |
| Add database query            | `modules/[module]/[module].repository.js` |
| Add validation                | `modules/[module]/[module].validation.js` |
| Add middleware                | `middleware/`                       |
| Add utility function          | `utils/`                            |
| Modify database schema        | `prisma/schema.prisma`              |
| Configure environment         | `.env`                              |
| Update dependencies           | `package.json`                      |
| Check API docs                | `/api-docs` endpoint                |

---

**Last Updated:** 2024
**Project Version:** 1.0.0
