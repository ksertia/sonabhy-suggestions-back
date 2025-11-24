# Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│                  (Web/Mobile/API Consumers)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      Express.js Server                           │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Middleware Layer                            │   │
│  │  • CORS                    • Helmet (Security)           │   │
│  │  • Body Parser             • Morgan (Logging)            │   │
│  │  • Authentication          • Request Validation          │   │
│  │  • RBAC                    • Error Handler               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Route Layer                             │   │
│  │  • /api/v1/auth     • /api/v1/users                      │   │
│  │  • /api/v1/files    • /api-docs (Swagger)               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               Controller Layer                           │   │
│  │  • auth.controller   • user.controller                   │   │
│  │  • file.controller                                       │   │
│  │  (Handle HTTP requests/responses)                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                Service Layer                             │   │
│  │  • auth.service     • user.service                       │   │
│  │  • file.service                                          │   │
│  │  (Business logic and validation)                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Repository Layer                            │   │
│  │  • auth.repository  • user.repository                    │   │
│  │  • file.repository                                       │   │
│  │  (Data access and Prisma queries)                        │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────────────┬───────────────────────────────────┘
                             │
                             │ Prisma ORM
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    PostgreSQL Database                           │
│  • users           • refresh_tokens      • files                │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      File System Storage                          │
│                        (uploads/)                                 │
└──────────────────────────────────────────────────────────────────┘
```

## Clean Architecture Layers

### 1. **Controller Layer**
- **Responsibility**: Handle HTTP requests and responses
- **Files**: `*.controller.js`
- **Functions**:
  - Parse request data
  - Call service methods
  - Format responses
  - Handle errors via middleware

### 2. **Service Layer**
- **Responsibility**: Business logic and orchestration
- **Files**: `*.service.js`
- **Functions**:
  - Implement business rules
  - Validate business constraints
  - Coordinate between repositories
  - Transform data

### 3. **Repository Layer**
- **Responsibility**: Data access and persistence
- **Files**: `*.repository.js`
- **Functions**:
  - Execute database queries
  - Abstract Prisma operations
  - Return raw data
  - No business logic

## Module Structure

Each module follows the same pattern:

```
modules/
└── [module-name]/
    ├── [module].controller.js   # HTTP layer
    ├── [module].service.js      # Business logic
    ├── [module].repository.js   # Data access
    ├── [module].routes.js       # Route definitions
    └── [module].validation.js   # Request schemas
```

## Authentication Flow

```
┌─────────┐
│ Client  │
└────┬────┘
     │
     │ 1. POST /auth/login
     │    { email, password }
     ▼
┌─────────────────┐
│ Auth Controller │
└────┬────────────┘
     │
     │ 2. Call authService.login()
     ▼
┌─────────────────┐
│  Auth Service   │
└────┬────────────┘
     │
     │ 3. Find user by email
     ▼
┌──────────────────┐
│ Auth Repository  │
└────┬─────────────┘
     │
     │ 4. Query database
     ▼
┌──────────────┐
│  PostgreSQL  │
└────┬─────────┘
     │
     │ 5. Return user
     ▼
┌─────────────────┐
│  Auth Service   │
│  • Verify pass  │
│  • Generate JWT │
│  • Store refresh│
└────┬────────────┘
     │
     │ 6. Return tokens
     ▼
┌─────────────────┐
│ Auth Controller │
└────┬────────────┘
     │
     │ 7. Send response
     ▼
┌─────────┐
│ Client  │
│ Stores  │
│ tokens  │
└─────────┘
```

## Protected Route Flow

```
┌─────────┐
│ Client  │
└────┬────┘
     │
     │ 1. GET /users/:id
     │    Authorization: Bearer <token>
     ▼
┌──────────────────────┐
│ Auth Middleware      │
│ • Verify JWT         │
│ • Check user exists  │
│ • Check user active  │
│ • Attach user to req │
└────┬─────────────────┘
     │
     │ 2. Check permissions
     ▼
┌──────────────────────┐
│ RBAC Middleware      │
│ • Check user role    │
│ • Verify permissions │
└────┬─────────────────┘
     │
     │ 3. Process request
     ▼
┌──────────────────────┐
│ User Controller      │
└────┬─────────────────┘
     │
     │ 4. Business logic
     ▼
┌──────────────────────┐
│ User Service         │
└────┬─────────────────┘
     │
     │ 5. Data access
     ▼
┌──────────────────────┐
│ User Repository      │
└────┬─────────────────┘
     │
     │ 6. Return data
     ▼
┌─────────┐
│ Client  │
└─────────┘
```

## File Upload Flow

```
┌─────────┐
│ Client  │
└────┬────┘
     │
     │ 1. POST /files/upload
     │    multipart/form-data
     │    Authorization: Bearer <token>
     ▼
┌──────────────────────┐
│ Auth Middleware      │
└────┬─────────────────┘
     │
     │ 2. Process file
     ▼
┌──────────────────────┐
│ Upload Middleware    │
│ (Multer)             │
│ • Validate type      │
│ • Check size         │
│ • Save to disk       │
└────┬─────────────────┘
     │
     │ 3. Save metadata
     ▼
┌──────────────────────┐
│ File Controller      │
└────┬─────────────────┘
     │
     │ 4. Create record
     ▼
┌──────────────────────┐
│ File Service         │
└────┬─────────────────┘
     │
     │ 5. Store in DB
     ▼
┌──────────────────────┐
│ File Repository      │
└────┬─────────────────┘
     │
     │ 6. Return file info
     ▼
┌─────────┐
│ Client  │
└─────────┘

File stored in:
┌──────────────────────┐
│ uploads/             │
│ └── filename.ext     │
└──────────────────────┘

Metadata stored in:
┌──────────────────────┐
│ PostgreSQL           │
│ └── files table      │
└──────────────────────┘
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                          users                               │
├─────────────────────────────────────────────────────────────┤
│ id            UUID (PK)                                      │
│ email         String (Unique)                                │
│ password      String (Hashed)                                │
│ firstName     String                                         │
│ lastName      String                                         │
│ role          Enum (USER, MANAGER, ADMIN)                    │
│ isActive      Boolean                                        │
│ createdAt     DateTime                                       │
│ updatedAt     DateTime                                       │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ 1:N
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
        ▼                                         ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│    refresh_tokens       │         │         files           │
├─────────────────────────┤         ├─────────────────────────┤
│ id          UUID (PK)   │         │ id          UUID (PK)   │
│ token       String      │         │ originalName String     │
│ userId      UUID (FK)   │         │ filename    String      │
│ expiresAt   DateTime    │         │ mimetype    String      │
│ createdAt   DateTime    │         │ size        Int         │
└─────────────────────────┘         │ path        String      │
                                    │ uploadedById UUID (FK)  │
                                    │ createdAt   DateTime    │
                                    │ updatedAt   DateTime    │
                                    └─────────────────────────┘
```

## Security Features

### 1. **Authentication**
- JWT-based stateless authentication
- Access tokens (short-lived, 15 minutes)
- Refresh tokens (long-lived, 7 days)
- Secure password hashing with bcrypt

### 2. **Authorization**
- Role-Based Access Control (RBAC)
- Three roles: USER, MANAGER, ADMIN
- Middleware-based permission checks
- Resource ownership validation

### 3. **Request Security**
- Helmet.js for security headers
- CORS configuration
- Request validation with Zod
- File type and size restrictions

### 4. **Error Handling**
- Custom error classes
- Global error handler
- Operational vs programming errors
- Safe error messages in production

## API Versioning

Current version: `v1`

All endpoints are prefixed with `/api/v1`:
- `/api/v1/auth/*`
- `/api/v1/users/*`
- `/api/v1/files/*`

Future versions can be added:
- `/api/v2/...`

## Environment Configuration

```
Development:
├── Detailed logging
├── Prisma query logs
├── Detailed error messages
└── CORS: Allow all

Production:
├── Minimal logging
├── Error logs only
├── Generic error messages
└── CORS: Specific origins
```

## Scalability Considerations

### Current Implementation
- Single server instance
- File storage on local disk
- In-memory session (JWT stateless)

### Future Enhancements
- **Horizontal Scaling**: Load balancer + multiple instances
- **File Storage**: S3/Cloud storage instead of local disk
- **Caching**: Redis for sessions and frequently accessed data
- **Database**: Read replicas for scaling reads
- **Rate Limiting**: Protect against abuse
- **Message Queue**: For async operations (email, notifications)

## Testing Strategy

### Unit Tests
- Test individual functions
- Mock dependencies
- Focus on business logic

### Integration Tests
- Test API endpoints
- Use test database
- Verify request/response flow

### E2E Tests
- Test complete user flows
- Authentication → Action → Verification
- Use staging environment

## Monitoring & Logging

### Recommended Tools
- **Logging**: Winston, Pino
- **Monitoring**: PM2, New Relic
- **Error Tracking**: Sentry
- **APM**: Datadog, AppDynamics

### Key Metrics
- Request rate
- Response time
- Error rate
- Database query performance
- File upload success rate

## Deployment Architecture

```
┌─────────────────┐
│   Load Balancer │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│ App 1  │ │ App 2  │
└───┬────┘ └───┬────┘
    │          │
    └────┬─────┘
         │
    ┌────▼────┐
    │ Database│
    └─────────┘
         │
    ┌────▼────┐
    │ Storage │
    └─────────┘
```

## Best Practices Implemented

✅ Separation of concerns (MVC pattern)
✅ Dependency injection
✅ Error handling
✅ Input validation
✅ Security headers
✅ API documentation
✅ Environment configuration
✅ Database migrations
✅ Clean code structure
✅ RESTful API design

## Contributing Guidelines

1. Follow the existing module structure
2. Add validation schemas for new endpoints
3. Update Swagger documentation
4. Write tests for new features
5. Follow ESLint rules
6. Use meaningful commit messages
7. Update README for major changes
