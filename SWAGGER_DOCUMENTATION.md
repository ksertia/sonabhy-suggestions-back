# Swagger/OpenAPI 3.0 Documentation

## Complete API Documentation for Idea Box Backend

This document provides comprehensive Swagger/OpenAPI 3.0 documentation for all modules.

## Access Swagger UI

Once the server is running, access the interactive API documentation at:

```
http://localhost:3000/api-docs
```

## API Overview

**Base URL**: `http://localhost:3000/api/v1`

**Authentication**: Bearer JWT Token

**Content-Type**: `application/json` (except file uploads: `multipart/form-data`)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Ideas](#ideas)
3. [Dynamic Forms](#dynamic-forms)
4. [Plan Actions](#plan-actions)
5. [Dashboard](#dashboard)
6. [Notifications](#notifications)
7. [File Upload](#file-upload)
8. [Common Schemas](#common-schemas)
9. [Error Codes](#error-codes)

---

## Authentication

### Register User
**POST** `/api/v1/auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstname": "John",
  "lastname": "Doe",
  "role": "USER"
}
```

**Response** (201):
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
      "role": "USER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
**POST** `/api/v1/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "uuid", "email": "user@example.com", "role": "USER" },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### Refresh Token
**POST** `/api/v1/auth/refresh`

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Ideas

### Create Idea
**POST** `/api/v1/ideas`

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "title": "AI Chatbot Implementation",
  "description": "Implement an AI-powered chatbot for customer support",
  "categoryId": "uuid",
  "statusId": "uuid",
  "expectedBenefits": "Reduce response time by 50%",
  "estimatedCost": 50000
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Idea created successfully",
  "data": {
    "idea": {
      "id": "uuid",
      "title": "AI Chatbot Implementation",
      "description": "...",
      "userId": "uuid",
      "categoryId": "uuid",
      "statusId": "uuid",
      "createdAt": "2024-11-23T15:00:00Z"
    }
  }
}
```

### Get All Ideas
**GET** `/api/v1/ideas?page=1&limit=10&categoryId=uuid&status=SUBMITTED`

**Response** (200):
```json
{
  "success": true,
  "message": "Ideas retrieved successfully",
  "data": {
    "ideas": [
      {
        "id": "uuid",
        "title": "AI Chatbot",
        "category": { "name": "Innovation", "color": "#3B82F6" },
        "status": { "name": "Submitted", "color": "#F59E0B" },
        "user": { "firstname": "John", "lastname": "Doe" }
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

### Update Idea Status
**PATCH** `/api/v1/ideas/{id}/status`

**Headers**: `Authorization: Bearer {managerToken}`

**Request Body**:
```json
{
  "statusId": "uuid"
}
```

---

## Dynamic Forms

### Create Form Model
**POST** `/api/v1/forms/models`

**Headers**: `Authorization: Bearer {adminToken}`

**Request Body**:
```json
{
  "name": "Idea Submission Form",
  "description": "Standard form for submitting ideas"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Form model created successfully",
  "data": {
    "model": {
      "id": "uuid",
      "name": "Idea Submission Form",
      "description": "...",
      "createdAt": "2024-11-23T15:00:00Z"
    }
  }
}
```

### Create Form Field
**POST** `/api/v1/forms/fields`

**Request Body**:
```json
{
  "variantId": "uuid",
  "label": "Email Address",
  "type": "EMAIL",
  "required": true,
  "order": 1,
  "placeholder": "Enter your email",
  "helpText": "We'll never share your email"
}
```

**Field Types**: `TEXT`, `TEXTAREA`, `NUMBER`, `EMAIL`, `DATE`, `SELECT`, `MULTISELECT`, `CHECKBOX`, `RADIO`, `FILE`

### Get Form Structure
**GET** `/api/v1/forms/structure/{variantId}`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Standard Version",
    "model": { "name": "Idea Submission Form" },
    "fields": [
      {
        "id": "uuid",
        "label": "Title",
        "type": "TEXT",
        "required": true,
        "order": 1
      },
      {
        "id": "uuid",
        "label": "Category",
        "type": "SELECT",
        "required": true,
        "order": 2,
        "options": {
          "choices": ["Innovation", "Process Improvement"]
        }
      }
    ]
  }
}
```

### Validate Form Submission
**POST** `/api/v1/forms/validate/{variantId}`

**Request Body**:
```json
{
  "submission": {
    "Title": "My Idea",
    "Category": "Innovation",
    "Email": "user@example.com"
  }
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": [],
    "data": {
      "field-uuid-1": "My Idea",
      "field-uuid-2": "Innovation",
      "field-uuid-3": "user@example.com"
    }
  }
}
```

---

## Plan Actions

### Create Plan Action
**POST** `/api/v1/plan-actions`

**Headers**: `Authorization: Bearer {managerToken}`

**Request Body**:
```json
{
  "ideaId": "uuid",
  "title": "Research AI Solutions",
  "description": "Evaluate different AI chatbot providers",
  "progress": 0,
  "deadline": "2024-12-31T00:00:00.000Z",
  "assignedTo": "uuid"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Plan action created successfully",
  "data": {
    "planAction": {
      "id": "uuid",
      "title": "Research AI Solutions",
      "progress": 0,
      "deadline": "2024-12-31T00:00:00.000Z",
      "assignee": {
        "email": "user@example.com",
        "firstname": "John"
      }
    }
  }
}
```

### Update Progress
**PATCH** `/api/v1/plan-actions/{id}/progress`

**Request Body**:
```json
{
  "progress": 75
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Progress updated successfully",
  "data": {
    "planAction": {
      "id": "uuid",
      "progress": 75
    }
  }
}
```

### Get Plan Actions
**GET** `/api/v1/plan-actions?status=in_progress&assignedTo=uuid`

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `ideaId`: Filter by idea
- `assignedTo`: Filter by assigned user
- `status`: `completed`, `in_progress`, `not_started`
- `overdue`: `true` or `false`
- `progressMin`: Minimum progress (0-100)
- `progressMax`: Maximum progress (0-100)

---

## Dashboard

### Get Overview Stats
**GET** `/api/v1/dashboard/overview`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalIdeas": 150,
      "ideasByCategory": [
        {
          "categoryId": "uuid",
          "categoryName": "Innovation",
          "color": "#3B82F6",
          "count": 45
        }
      ],
      "ideasByStatus": [
        {
          "statusId": "uuid",
          "statusName": "Submitted",
          "color": "#F59E0B",
          "count": 30
        }
      ],
      "ideasWithActions": {
        "totalIdeas": 150,
        "ideasWithActions": 75,
        "percentage": 50
      },
      "planActionsProgress": {
        "total": 50,
        "completed": 15,
        "inProgress": 25,
        "notStarted": 10,
        "overdue": 5,
        "avgProgress": 60,
        "completionRate": 30
      },
      "topCategories": [...],
      "statusDistribution": [...]
    }
  }
}
```

### Get Monthly Trends
**GET** `/api/v1/dashboard/monthly-trends?months=12`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "trends": [
      { "month": "2024-01", "count": 12 },
      { "month": "2024-02", "count": 18 },
      { "month": "2024-03", "count": 15 }
    ]
  }
}
```

### Get Admin Dashboard
**GET** `/api/v1/dashboard/admin`

**Headers**: `Authorization: Bearer {managerToken}`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "dashboard": {
      "overallStats": {
        "totalUsers": 50,
        "totalIdeas": 150,
        "totalCategories": 10,
        "totalPlanActions": 75
      },
      "overviewStats": {...},
      "monthlyTrends": [...],
      "topCategories": [...],
      "ideasByRole": [
        { "role": "USER", "userCount": 40, "ideaCount": 80 }
      ]
    }
  }
}
```

---

## Notifications

### Get User Notifications
**GET** `/api/v1/notifications?isRead=false&page=1&limit=20`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "IDEA_SUBMITTED",
        "message": "Your idea 'AI Chatbot' has been submitted successfully.",
        "metadata": {
          "ideaId": "uuid",
          "ideaTitle": "AI Chatbot"
        },
        "isRead": false,
        "createdAt": "2024-11-23T15:00:00Z"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

### Get Unread Count
**GET** `/api/v1/notifications/unread-count`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

### Mark as Read
**PATCH** `/api/v1/notifications/{id}/read`

**Response** (200):
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### Notification Types
- `IDEA_SUBMITTED`
- `IDEA_STATUS_CHANGED`
- `PLAN_ACTION_ASSIGNED`
- `COMMENT_ADDED`
- `PLAN_ACTION_UPDATED`
- `IDEA_APPROVED`
- `IDEA_REJECTED`
- `MENTION`
- `SYSTEM`

---

## File Upload

### Upload Single File
**POST** `/api/v1/files/upload`

**Headers**: 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Form Data**:
- `file`: File to upload (max 5MB)

**Response** (201):
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "file": {
      "id": "uuid",
      "originalName": "document.pdf",
      "storageName": "document-1234567890.pdf",
      "mimeType": "application/pdf",
      "size": 102400,
      "path": "/uploads/document-1234567890.pdf",
      "uploadedById": "uuid",
      "createdAt": "2024-11-23T15:00:00Z"
    }
  }
}
```

### Upload Multiple Files
**POST** `/api/v1/files/upload-multiple`

**Form Data**:
- `files`: Array of files (max 10 files)

### Download File
**GET** `/api/v1/files/{id}/download`

**Response**: Binary file stream with headers:
- `Content-Type`: File MIME type
- `Content-Disposition`: `attachment; filename="original-name.pdf"`
- `Content-Length`: File size

### Get Files
**GET** `/api/v1/files?page=1&limit=10&mimeType=application/pdf`

**Query Parameters**:
- `page`: Page number
- `limit`: Items per page
- `uploadedById`: Filter by uploader
- `mimeType`: Filter by MIME type
- `search`: Search in filename
- `startDate`: Filter from date
- `endDate`: Filter to date

### Get File Statistics
**GET** `/api/v1/files/stats`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 50,
      "byMimeType": [
        { "mimeType": "application/pdf", "_count": 20 },
        { "mimeType": "image/jpeg", "_count": 15 }
      ],
      "totalSize": 52428800
    }
  }
}
```

---

## Common Schemas

### User Schema
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstname": "John",
  "lastname": "Doe",
  "role": "USER | MANAGER | ADMIN",
  "isActive": true,
  "createdAt": "2024-11-23T15:00:00Z",
  "updatedAt": "2024-11-23T15:00:00Z"
}
```

### Idea Schema
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "userId": "uuid",
  "categoryId": "uuid",
  "statusId": "uuid",
  "expectedBenefits": "string",
  "estimatedCost": 50000,
  "createdAt": "2024-11-23T15:00:00Z",
  "updatedAt": "2024-11-23T15:00:00Z",
  "user": { "User Schema" },
  "category": { "Category Schema" },
  "status": { "Status Schema" }
}
```

### Category Schema
```json
{
  "id": "uuid",
  "name": "Innovation",
  "description": "Innovative ideas",
  "color": "#3B82F6",
  "order": 1
}
```

### Status Schema
```json
{
  "id": "uuid",
  "name": "Submitted",
  "description": "Idea has been submitted",
  "color": "#F59E0B",
  "order": 1
}
```

### PlanAction Schema
```json
{
  "id": "uuid",
  "ideaId": "uuid",
  "title": "string",
  "description": "string",
  "progress": 0-100,
  "deadline": "2024-12-31T00:00:00.000Z",
  "assignedTo": "uuid",
  "createdAt": "2024-11-23T15:00:00Z",
  "updatedAt": "2024-11-23T15:00:00Z"
}
```

### Pagination Schema
```json
{
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

---

## Error Codes

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error - Server error |

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Common Errors

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**409 Conflict**:
```json
{
  "success": false,
  "message": "Email already exists"
}
```

---

## Authentication Flow

1. **Register**: `POST /api/v1/auth/register`
   - Receive `accessToken` and `refreshToken`

2. **Use Access Token**: Include in headers
   ```
   Authorization: Bearer {accessToken}
   ```

3. **Refresh Token**: When access token expires
   - `POST /api/v1/auth/refresh` with `refreshToken`
   - Receive new `accessToken` and `refreshToken`

4. **Logout**: `POST /api/v1/auth/logout`
   - Invalidates all refresh tokens

---

## Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 requests per 15 minutes per IP

---

## File Upload Constraints

- **Max file size**: 5MB (configurable via `MAX_FILE_SIZE`)
- **Allowed types**: 
  - Images: JPEG, PNG, GIF
  - Documents: PDF, DOC, DOCX
- **Max files per upload**: 10 (for multiple upload)
- **Storage location**: `/uploads` directory

---

## Pagination

All list endpoints support pagination:

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

## Filtering

Most list endpoints support filtering via query parameters:

**Examples**:
- `/api/v1/ideas?categoryId=uuid&status=SUBMITTED`
- `/api/v1/plan-actions?assignedTo=uuid&overdue=true`
- `/api/v1/files?mimeType=application/pdf&startDate=2024-01-01`

---

## Sorting

Default sorting: Most recent first (`createdAt DESC`)

Custom sorting available on specific endpoints.

---

## Testing with Swagger UI

1. Start the server: `npm start`
2. Open browser: `http://localhost:3000/api-docs`
3. Click "Authorize" button
4. Enter JWT token: `Bearer {your-token}`
5. Test endpoints interactively

---

## Postman Collection

Import the Swagger JSON to Postman:

1. Access: `http://localhost:3000/api-docs.json`
2. Copy JSON
3. Import to Postman: File > Import > Raw Text

---

## Example Workflows

### Complete Idea Submission Flow

1. **Register/Login**
   ```
   POST /api/v1/auth/login
   ```

2. **Get Categories**
   ```
   GET /api/v1/categories
   ```

3. **Submit Idea**
   ```
   POST /api/v1/ideas
   ```

4. **Upload Files**
   ```
   POST /api/v1/files/upload
   ```

5. **Check Notifications**
   ```
   GET /api/v1/notifications
   ```

### Manager Workflow

1. **Login as Manager**
   ```
   POST /api/v1/auth/login
   ```

2. **View All Ideas**
   ```
   GET /api/v1/ideas
   ```

3. **Change Idea Status**
   ```
   PATCH /api/v1/ideas/{id}/status
   ```

4. **Create Plan Action**
   ```
   POST /api/v1/plan-actions
   ```

5. **Assign to User**
   ```
   PATCH /api/v1/plan-actions/{id}/assign
   ```

---

## Summary

✅ **7 Modules** fully documented
✅ **100+ Endpoints** with examples
✅ **Complete Schemas** for all entities
✅ **Error Codes** and responses
✅ **Authentication** flow documented
✅ **Filtering & Pagination** explained
✅ **File Upload** specifications
✅ **Interactive Testing** via Swagger UI

Access the live documentation at: `http://localhost:3000/api-docs` 🚀
