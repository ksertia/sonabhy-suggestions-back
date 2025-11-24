# API Usage Examples

Complete examples for testing all API endpoints.

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication Examples

### 1. Register New User

**Endpoint:** `POST /auth/register`

**Request:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "USER"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "admin@ideabox.com",
  "password": "Admin@123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "admin@ideabox.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Refresh Access Token

**Endpoint:** `POST /auth/refresh`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "admin@ideabox.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN",
      "isActive": true
    }
  }
}
```

### 4. Get Profile

**Endpoint:** `GET /auth/profile`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "admin@ideabox.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 5. Logout

**Endpoint:** `POST /auth/logout`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {
    "message": "Logged out successfully"
  }
}
```

## User Management Examples

### 1. Get All Users (Admin Only)

**Endpoint:** `GET /users?page=1&limit=10`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "admin@ideabox.com",
        "firstName": "Admin",
        "lastName": "User",
        "role": "ADMIN",
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 2. Get User by ID

**Endpoint:** `GET /users/{id}`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "admin@ideabox.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 3. Update User

**Endpoint:** `PUT /users/{id}`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john.smith@example.com",
      "firstName": "John",
      "lastName": "Smith",
      "role": "USER",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:45:00.000Z"
    }
  }
}
```

### 4. Delete User (Admin Only)

**Endpoint:** `DELETE /users/{id}`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "message": "User deleted successfully"
  }
}
```

## File Management Examples

### 1. Upload File

**Endpoint:** `POST /files/upload`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data
```

**Form Data:**
```
file: [binary file data]
```

**Response (201):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "file": {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "originalName": "document.pdf",
      "filename": "document-1705318200000-123456789.pdf",
      "mimetype": "application/pdf",
      "size": 1024000,
      "path": "uploads/document-1705318200000-123456789.pdf",
      "uploadedById": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "uploadedBy": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "admin@ideabox.com",
        "firstName": "Admin",
        "lastName": "User"
      }
    }
  }
}
```

### 2. Get All Files

**Endpoint:** `GET /files?page=1&limit=10`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Files retrieved successfully",
  "data": {
    "files": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "originalName": "document.pdf",
        "filename": "document-1705318200000-123456789.pdf",
        "mimetype": "application/pdf",
        "size": 1024000,
        "path": "uploads/document-1705318200000-123456789.pdf",
        "uploadedById": "550e8400-e29b-41d4-a716-446655440000",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "uploadedBy": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "email": "admin@ideabox.com",
          "firstName": "Admin",
          "lastName": "User"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 3. Get File by ID

**Endpoint:** `GET /files/{id}`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "message": "File retrieved successfully",
  "data": {
    "file": {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "originalName": "document.pdf",
      "filename": "document-1705318200000-123456789.pdf",
      "mimetype": "application/pdf",
      "size": 1024000,
      "path": "uploads/document-1705318200000-123456789.pdf",
      "uploadedById": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "uploadedBy": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "admin@ideabox.com",
        "firstName": "Admin",
        "lastName": "User"
      }
    }
  }
}
```

### 4. Download File

**Endpoint:** `GET /files/{id}/download`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```
[Binary file data with appropriate headers]
Content-Type: application/pdf
Content-Disposition: attachment; filename="document.pdf"
Content-Length: 1024000
```

### 5. Delete File

**Endpoint:** `DELETE /files/{id}`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": {
    "message": "File deleted successfully"
  }
}
```

## Error Response Examples

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.email",
      "message": "Invalid email address"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired access token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

### 422 Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## cURL Examples

### Register
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ideabox.com",
    "password": "Admin@123"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Upload File
```bash
curl -X POST http://localhost:3000/api/v1/files/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/file.pdf"
```

### Get All Users
```bash
curl -X GET "http://localhost:3000/api/v1/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## PowerShell Examples (Windows)

### Register
```powershell
$body = @{
    email = "test@example.com"
    password = "Test@123"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/register" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### Login
```powershell
$body = @{
    email = "admin@ideabox.com"
    password = "Admin@123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body

$token = $response.data.accessToken
```

### Get Profile
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/profile" `
  -Method Get `
  -Headers $headers
```

## JavaScript/Fetch Examples

### Register
```javascript
const response = await fetch('http://localhost:3000/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'Test@123',
    firstName: 'Test',
    lastName: 'User',
  }),
});

const data = await response.json();
console.log(data);
```

### Login and Store Token
```javascript
const response = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@ideabox.com',
    password: 'Admin@123',
  }),
});

const data = await response.json();
const accessToken = data.data.accessToken;
const refreshToken = data.data.refreshToken;

// Store tokens
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
```

### Authenticated Request
```javascript
const token = localStorage.getItem('accessToken');

const response = await fetch('http://localhost:3000/api/v1/auth/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();
console.log(data);
```

### Upload File
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const token = localStorage.getItem('accessToken');

const response = await fetch('http://localhost:3000/api/v1/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});

const data = await response.json();
console.log(data);
```

## Testing Workflow

### Complete User Journey

1. **Register** → Get tokens
2. **Login** → Get tokens
3. **Get Profile** → Verify authentication
4. **Upload File** → Get file ID
5. **Get Files** → See uploaded file
6. **Download File** → Retrieve file
7. **Update Profile** → Change user info
8. **Delete File** → Remove file
9. **Logout** → Invalidate refresh token

### Admin Workflow

1. **Login as Admin** → Get admin tokens
2. **Get All Users** → View all users
3. **Update User Role** → Change user permissions
4. **View All Files** → See all uploaded files
5. **Delete User** → Remove user account

## Rate Limiting (Future Enhancement)

When rate limiting is implemented:

```json
{
  "success": false,
  "message": "Too many requests, please try again later",
  "retryAfter": 60
}
```

Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1705318260
```
