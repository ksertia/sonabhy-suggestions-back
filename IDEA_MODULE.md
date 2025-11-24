# Idea Module Documentation

Complete guide to the Idea Management module with CRUD operations, workflow actions, filtering, and file uploads.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Filtering & Pagination](#filtering--pagination)
- [File Upload](#file-upload)
- [Comments](#comments)
- [Plan Actions](#plan-actions)
- [Permissions](#permissions)
- [Usage Examples](#usage-examples)

---

## 🎯 Overview

The Idea module manages the complete lifecycle of ideas from submission to implementation, including:
- CRUD operations
- Advanced filtering and search
- Workflow status management
- File attachments
- Internal comments (Manager/Admin)
- Plan action creation
- Statistics and analytics

---

## ✨ Features

### ✅ CRUD Operations
- Create new ideas
- List ideas with filtering
- Get idea details
- Update ideas
- Delete ideas

### ✅ Workflow Management
- Status transitions
- Urgency levels (LOW, MEDIUM, HIGH, CRITICAL)
- Impact assessment (LOW, MEDIUM, HIGH, VERY_HIGH)
- Category classification

### ✅ Advanced Filtering
- Filter by category
- Filter by status
- Filter by urgency/impact
- Filter by form variant
- Date range filtering
- Full-text search
- Anonymous/non-anonymous ideas

### ✅ File Management
- Single file upload
- Multiple file upload
- File metadata storage
- Automatic file attachment to ideas

### ✅ Collaboration
- Internal comments (Manager/Admin only)
- Plan action creation from ideas
- User assignment
- Progress tracking

### ✅ Permissions
- Role-based access control
- Owner-based permissions
- Anonymous idea support

---

## 🔌 API Endpoints

### Base URL
```
/api/v1/ideas
```

### Endpoints Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/` | ✅ | All | Create idea |
| GET | `/` | ✅ | All | List ideas (filtered) |
| GET | `/stats` | ✅ | All | Get statistics |
| GET | `/:id` | ✅ | All | Get idea by ID |
| PUT | `/:id` | ✅ | Owner/Admin | Update idea |
| DELETE | `/:id` | ✅ | Owner/Admin | Delete idea |
| PATCH | `/:id/status` | ✅ | Manager/Admin | Update status |
| POST | `/:id/files` | ✅ | Owner/Manager/Admin | Upload files |
| POST | `/:id/comments` | ✅ | Manager/Admin | Add comment |
| GET | `/:id/comments` | ✅ | Owner/Manager/Admin | Get comments |
| POST | `/:id/plan-actions` | ✅ | Manager/Admin | Create plan action |
| GET | `/:id/plan-actions` | ✅ | Owner/Manager/Admin | Get plan actions |

---

## 📝 Detailed Endpoint Documentation

### 1. Create Idea

**POST** `/api/v1/ideas`

Create a new idea submission.

**Request Body:**
```json
{
  "title": "Implement AI-powered customer support",
  "description": "Use AI chatbots to handle common customer queries and reduce response time",
  "categoryId": "uuid",
  "statusId": "uuid",
  "urgency": "HIGH",
  "impact": "VERY_HIGH",
  "isAnonymous": false,
  "formVariantId": "uuid"
}
```

**Validation:**
- `title`: 3-200 characters (required)
- `description`: Min 10 characters (required)
- `categoryId`: Valid UUID (required)
- `statusId`: Valid UUID (optional)
- `urgency`: LOW | MEDIUM | HIGH | CRITICAL (optional, default: MEDIUM)
- `impact`: LOW | MEDIUM | HIGH | VERY_HIGH (optional, default: MEDIUM)
- `isAnonymous`: Boolean (optional, default: false)
- `formVariantId`: Valid UUID (required)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Idea created successfully",
  "data": {
    "idea": {
      "id": "uuid",
      "title": "Implement AI-powered customer support",
      "description": "Use AI chatbots...",
      "categoryId": "uuid",
      "statusId": "uuid",
      "urgency": "HIGH",
      "impact": "VERY_HIGH",
      "isAnonymous": false,
      "userId": "uuid",
      "formVariantId": "uuid",
      "metadataId": null,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z",
      "category": {
        "id": "uuid",
        "name": "Technology"
      },
      "status": {
        "id": "uuid",
        "name": "Submitted",
        "order": 1,
        "color": "#3B82F6"
      },
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "firstname": "John",
        "lastname": "Doe"
      }
    }
  }
}
```

---

### 2. List Ideas (with Filtering & Pagination)

**GET** `/api/v1/ideas`

Get all ideas with advanced filtering and pagination.

**Query Parameters:**
```
?page=1
&limit=10
&categoryId=uuid
&statusId=uuid
&urgency=HIGH
&impact=VERY_HIGH
&formVariantId=uuid
&userId=uuid
&isAnonymous=true
&search=AI
&startDate=2024-01-01T00:00:00.000Z
&endDate=2024-12-31T23:59:59.999Z
```

**Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `categoryId`: Filter by category
- `statusId`: Filter by status
- `urgency`: Filter by urgency level
- `impact`: Filter by impact level
- `formVariantId`: Filter by form variant
- `userId`: Filter by user (Admin/Manager only)
- `isAnonymous`: Filter anonymous ideas
- `search`: Full-text search in title/description
- `startDate`: Filter from date
- `endDate`: Filter to date

**Success Response (200):**
```json
{
  "success": true,
  "message": "Ideas retrieved successfully",
  "data": {
    "ideas": [
      {
        "id": "uuid",
        "title": "Implement AI-powered customer support",
        "description": "Use AI chatbots...",
        "category": { "name": "Technology" },
        "status": { "name": "Submitted", "color": "#3B82F6" },
        "urgency": "HIGH",
        "impact": "VERY_HIGH",
        "user": {
          "firstname": "John",
          "lastname": "Doe"
        },
        "_count": {
          "planActions": 2,
          "comments": 5
        },
        "createdAt": "2024-01-15T10:00:00.000Z"
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

**Note:** Regular users (USER role) can only see their own ideas. Managers and Admins can see all ideas.

---

### 3. Get Idea Statistics

**GET** `/api/v1/ideas/stats`

Get aggregated statistics about ideas.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Idea statistics retrieved successfully",
  "data": {
    "stats": {
      "total": 50,
      "byStatus": [
        { "statusId": "uuid", "_count": 15 },
        { "statusId": "uuid", "_count": 20 }
      ],
      "byCategory": [
        { "categoryId": "uuid", "_count": 10 },
        { "categoryId": "uuid", "_count": 8 }
      ],
      "byUrgency": [
        { "urgency": "HIGH", "_count": 12 },
        { "urgency": "MEDIUM", "_count": 25 }
      ],
      "byImpact": [
        { "impact": "VERY_HIGH", "_count": 8 },
        { "impact": "HIGH", "_count": 18 }
      ]
    }
  }
}
```

---

### 4. Get Idea by ID

**GET** `/api/v1/ideas/:id`

Get detailed information about a specific idea.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Idea retrieved successfully",
  "data": {
    "idea": {
      "id": "uuid",
      "title": "Implement AI-powered customer support",
      "description": "Use AI chatbots...",
      "category": { "name": "Technology" },
      "status": { "name": "Submitted" },
      "urgency": "HIGH",
      "impact": "VERY_HIGH",
      "user": {
        "firstname": "John",
        "lastname": "Doe"
      },
      "formVariant": {
        "name": "Default Variant",
        "model": {
          "name": "Standard Idea Form"
        },
        "fields": [
          {
            "label": "Idea Title",
            "type": "TEXT",
            "required": true,
            "order": 1
          }
        ]
      },
      "metadata": {
        "originalName": "document.pdf",
        "storageName": "uuid-document.pdf",
        "mimeType": "application/pdf",
        "size": 102400
      },
      "planActions": [
        {
          "id": "uuid",
          "title": "Research AI solutions",
          "progress": 30,
          "deadline": "2024-03-31T00:00:00.000Z",
          "assignee": {
            "firstname": "Manager",
            "lastname": "User"
          }
        }
      ],
      "comments": [
        {
          "id": "uuid",
          "content": "Great idea!",
          "user": {
            "firstname": "Manager",
            "lastname": "User"
          },
          "createdAt": "2024-01-15T11:00:00.000Z"
        }
      ],
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

---

### 5. Update Idea

**PUT** `/api/v1/ideas/:id`

Update an existing idea. Only the owner or admin can update.

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "categoryId": "uuid",
  "urgency": "CRITICAL",
  "impact": "VERY_HIGH"
}
```

**Note:** Regular users cannot update `statusId`. Only managers/admins can change status.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Idea updated successfully",
  "data": {
    "idea": { /* updated idea object */ }
  }
}
```

---

### 6. Delete Idea

**DELETE** `/api/v1/ideas/:id`

Delete an idea. Only the owner or admin can delete.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Idea deleted successfully",
  "data": {
    "message": "Idea deleted successfully"
  }
}
```

**Note:** Deleting an idea also deletes associated files, comments, and plan actions (cascade).

---

### 7. Update Idea Status

**PATCH** `/api/v1/ideas/:id/status`

Update the workflow status of an idea. **Manager/Admin only**.

**Request Body:**
```json
{
  "statusId": "uuid"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Idea status updated successfully",
  "data": {
    "idea": {
      "id": "uuid",
      "title": "...",
      "status": {
        "id": "uuid",
        "name": "Approved",
        "order": 3,
        "color": "#10B981"
      }
    }
  }
}
```

---

### 8. Upload Files

**POST** `/api/v1/ideas/:id/files`

Upload single or multiple files to an idea.

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `files` (array)
- Max files: 10
- Max size per file: 5MB (configurable)

**Example (cURL):**
```bash
curl -X POST http://localhost:3000/api/v1/ideas/{id}/files \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@document1.pdf" \
  -F "files=@image1.jpg"
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "data": {
    "files": [
      {
        "id": "uuid",
        "originalName": "document1.pdf",
        "storageName": "uuid-document1.pdf",
        "mimeType": "application/pdf",
        "size": 102400,
        "path": "uploads/uuid-document1.pdf",
        "uploadedById": "uuid",
        "createdAt": "2024-01-15T10:00:00.000Z"
      },
      {
        "id": "uuid",
        "originalName": "image1.jpg",
        "storageName": "uuid-image1.jpg",
        "mimeType": "image/jpeg",
        "size": 51200,
        "path": "uploads/uuid-image1.jpg",
        "uploadedById": "uuid",
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

**Allowed File Types:**
- Images: JPEG, PNG, GIF
- Documents: PDF, DOC, DOCX
- (Configurable in `.env`)

---

### 9. Add Comment

**POST** `/api/v1/ideas/:id/comments`

Add an internal comment to an idea. **Manager/Admin only**.

**Request Body:**
```json
{
  "content": "Great idea! This could significantly improve our customer satisfaction scores."
}
```

**Validation:**
- `content`: 1-2000 characters (required)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "comment": {
      "id": "uuid",
      "ideaId": "uuid",
      "userId": "uuid",
      "content": "Great idea! This could...",
      "user": {
        "id": "uuid",
        "email": "manager@example.com",
        "firstname": "Manager",
        "lastname": "User",
        "role": "MANAGER"
      },
      "createdAt": "2024-01-15T11:00:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

---

### 10. Get Comments

**GET** `/api/v1/ideas/:id/comments`

Get all comments for an idea.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Comments retrieved successfully",
  "data": {
    "comments": [
      {
        "id": "uuid",
        "content": "Great idea!",
        "user": {
          "firstname": "Manager",
          "lastname": "User",
          "role": "MANAGER"
        },
        "createdAt": "2024-01-15T11:00:00.000Z"
      }
    ]
  }
}
```

---

### 11. Create Plan Action

**POST** `/api/v1/ideas/:id/plan-actions`

Create a plan action from an idea. **Manager/Admin only**.

**Request Body:**
```json
{
  "title": "Research AI chatbot solutions",
  "description": "Find suitable AI chatbot providers and compare features",
  "progress": 0,
  "deadline": "2024-03-31T00:00:00.000Z",
  "assignedTo": "uuid"
}
```

**Validation:**
- `title`: 3-200 characters (required)
- `description`: String (optional)
- `progress`: 0-100 (optional, default: 0)
- `deadline`: ISO 8601 datetime (optional)
- `assignedTo`: Valid user UUID (optional)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Plan action created successfully",
  "data": {
    "planAction": {
      "id": "uuid",
      "ideaId": "uuid",
      "title": "Research AI chatbot solutions",
      "description": "Find suitable AI chatbot providers...",
      "progress": 0,
      "deadline": "2024-03-31T00:00:00.000Z",
      "assignedTo": "uuid",
      "assignee": {
        "id": "uuid",
        "email": "manager@example.com",
        "firstname": "Manager",
        "lastname": "User",
        "role": "MANAGER"
      },
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

---

### 12. Get Plan Actions

**GET** `/api/v1/ideas/:id/plan-actions`

Get all plan actions for an idea.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Plan actions retrieved successfully",
  "data": {
    "planActions": [
      {
        "id": "uuid",
        "title": "Research AI chatbot solutions",
        "description": "Find suitable AI chatbot providers...",
        "progress": 30,
        "deadline": "2024-03-31T00:00:00.000Z",
        "assignee": {
          "firstname": "Manager",
          "lastname": "User"
        },
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

---

## 🔍 Filtering & Pagination

### Filter Examples

**Filter by category:**
```
GET /api/v1/ideas?categoryId=uuid
```

**Filter by status:**
```
GET /api/v1/ideas?statusId=uuid
```

**Filter by urgency and impact:**
```
GET /api/v1/ideas?urgency=HIGH&impact=VERY_HIGH
```

**Search in title/description:**
```
GET /api/v1/ideas?search=AI
```

**Date range filter:**
```
GET /api/v1/ideas?startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.999Z
```

**Combined filters:**
```
GET /api/v1/ideas?categoryId=uuid&urgency=HIGH&search=customer&page=2&limit=20
```

### Pagination

**Default:**
- Page: 1
- Limit: 10

**Custom pagination:**
```
GET /api/v1/ideas?page=3&limit=25
```

**Response includes:**
```json
{
  "pagination": {
    "total": 150,
    "page": 3,
    "limit": 25,
    "totalPages": 6
  }
}
```

---

## 📁 File Upload

### Single File Upload

```javascript
const formData = new FormData();
formData.append('files', fileInput.files[0]);

const response = await fetch(`/api/v1/ideas/${ideaId}/files`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});
```

### Multiple File Upload

```javascript
const formData = new FormData();
for (let file of fileInput.files) {
  formData.append('files', file);
}

const response = await fetch(`/api/v1/ideas/${ideaId}/files`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});
```

### File Storage

- **Location:** `uploads/` directory
- **Naming:** UUID + original extension
- **Metadata:** Stored in `file_metadata` table
- **Max Size:** 5MB per file (configurable)
- **Max Files:** 10 per request

---

## 💬 Comments

### Manager/Admin Only

Comments are internal notes visible only to managers and admins. Regular users cannot add or view comments on ideas they don't own.

### Use Cases

- Internal feedback
- Review notes
- Decision rationale
- Follow-up reminders

---

## 📋 Plan Actions

### Workflow Integration

Plan actions represent concrete steps to implement an idea:

1. Idea is approved
2. Manager creates plan actions
3. Actions are assigned to team members
4. Progress is tracked (0-100%)
5. Deadlines are set and monitored

### Example Workflow

```
Idea: "Implement AI chatbot"
  ↓
Status: Approved
  ↓
Plan Actions:
  1. Research solutions (30% complete, due: 2024-03-31)
  2. Cost-benefit analysis (0% complete, due: 2024-04-15)
  3. Pilot implementation (0% complete, due: 2024-05-30)
```

---

## 🔒 Permissions

### Role-Based Access

| Action | USER | MANAGER | ADMIN |
|--------|------|---------|-------|
| Create idea | ✅ | ✅ | ✅ |
| View own ideas | ✅ | ✅ | ✅ |
| View all ideas | ❌ | ✅ | ✅ |
| Update own idea | ✅ | ✅ | ✅ |
| Update any idea | ❌ | ❌ | ✅ |
| Delete own idea | ✅ | ✅ | ✅ |
| Delete any idea | ❌ | ❌ | ✅ |
| Update status | ❌ | ✅ | ✅ |
| Add comment | ❌ | ✅ | ✅ |
| View comments | Owner | ✅ | ✅ |
| Create plan action | ❌ | ✅ | ✅ |
| Upload files | Owner | ✅ | ✅ |

### Anonymous Ideas

- `isAnonymous: true` → `userId` is NULL
- Anonymous ideas can still be managed
- Creator identity is hidden

---

## 💻 Usage Examples

### JavaScript Client

```javascript
class IdeaClient {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async createIdea(data) {
    const response = await fetch(`${this.baseURL}/ideas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  async getIdeas(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}/ideas?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    return await response.json();
  }

  async updateStatus(ideaId, statusId) {
    const response = await fetch(`${this.baseURL}/ideas/${ideaId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify({ statusId }),
    });
    return await response.json();
  }

  async uploadFiles(ideaId, files) {
    const formData = new FormData();
    for (let file of files) {
      formData.append('files', file);
    }

    const response = await fetch(`${this.baseURL}/ideas/${ideaId}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });
    return await response.json();
  }

  async addComment(ideaId, content) {
    const response = await fetch(`${this.baseURL}/ideas/${ideaId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify({ content }),
    });
    return await response.json();
  }

  async createPlanAction(ideaId, data) {
    const response = await fetch(`${this.baseURL}/ideas/${ideaId}/plan-actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  }
}

// Usage
const client = new IdeaClient('http://localhost:3000/api/v1', token);

// Create idea
const idea = await client.createIdea({
  title: 'New AI Feature',
  description: 'Implement AI-powered recommendations',
  categoryId: 'uuid',
  formVariantId: 'uuid',
  urgency: 'HIGH',
  impact: 'VERY_HIGH',
});

// Get filtered ideas
const ideas = await client.getIdeas({
  categoryId: 'uuid',
  urgency: 'HIGH',
  page: 1,
  limit: 20,
});

// Update status (Manager/Admin)
await client.updateStatus(ideaId, newStatusId);

// Upload files
await client.uploadFiles(ideaId, fileInputElement.files);

// Add comment (Manager/Admin)
await client.addComment(ideaId, 'Approved for implementation');

// Create plan action (Manager/Admin)
await client.createPlanAction(ideaId, {
  title: 'Research AI solutions',
  deadline: '2024-03-31T00:00:00.000Z',
  assignedTo: managerId,
});
```

---

## 🧪 Testing

### Test Workflow

```bash
# 1. Login as user
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@ideabox.com", "password": "User@123"}'

# 2. Create idea
curl -X POST http://localhost:3000/api/v1/ideas \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Idea",
    "description": "This is a test idea submission",
    "categoryId": "CATEGORY_UUID",
    "formVariantId": "FORM_VARIANT_UUID",
    "urgency": "MEDIUM",
    "impact": "HIGH"
  }'

# 3. Get all ideas
curl -X GET http://localhost:3000/api/v1/ideas \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Filter ideas
curl -X GET "http://localhost:3000/api/v1/ideas?urgency=HIGH&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Upload file
curl -X POST http://localhost:3000/api/v1/ideas/IDEA_ID/files \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@document.pdf"

# 6. Update status (as Manager)
curl -X PATCH http://localhost:3000/api/v1/ideas/IDEA_ID/status \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"statusId": "STATUS_UUID"}'

# 7. Add comment (as Manager)
curl -X POST http://localhost:3000/api/v1/ideas/IDEA_ID/comments \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Great idea! Approved for next sprint."}'

# 8. Create plan action (as Manager)
curl -X POST http://localhost:3000/api/v1/ideas/IDEA_ID/plan-actions \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Research implementation options",
    "description": "Evaluate different approaches",
    "deadline": "2024-03-31T00:00:00.000Z",
    "assignedTo": "USER_UUID"
  }'
```

---

## 📊 Database Schema

### Idea Table

```prisma
model Idea {
  id            String      @id @default(uuid())
  title         String
  description   String      @db.Text
  categoryId    String
  statusId      String
  urgency       Urgency     @default(MEDIUM)
  impact        Impact      @default(MEDIUM)
  isAnonymous   Boolean     @default(false)
  userId        String?
  formVariantId String
  metadataId    String?     @unique
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  category      Category
  status        Status
  user          User?
  formVariant   FormVariant
  metadata      FileMetadata?
  planActions   PlanAction[]
  comments      Comment[]
}
```

---

## 🚀 Best Practices

1. **Always validate input** - Use Zod schemas
2. **Check permissions** - Verify user roles before operations
3. **Handle file cleanup** - Delete files when ideas are deleted
4. **Use transactions** - For complex operations
5. **Implement pagination** - For large datasets
6. **Log important events** - Idea creation, status changes
7. **Validate file types** - Security best practice
8. **Set file size limits** - Prevent abuse
9. **Use indexes** - On frequently filtered fields
10. **Cache statistics** - For better performance

---

**Last Updated:** 2024
**Module Version:** 1.0.0
