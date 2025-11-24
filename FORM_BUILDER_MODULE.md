# Dynamic Form Builder Module Documentation

Complete guide to the Dynamic Form Builder module for creating, managing, and validating custom forms.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Field Types](#field-types)
- [Form Structure](#form-structure)
- [Dynamic Validation](#dynamic-validation)
- [Drag & Drop Support](#drag--drop-support)
- [Usage Examples](#usage-examples)

---

## 🎯 Overview

The Dynamic Form Builder allows administrators and managers to create custom forms without code changes. Forms are composed of:
- **Form Models** - Templates for different types of forms
- **Form Variants** - Different versions of a form model
- **Form Fields** - Individual fields with types, validation, and options

---

## ✨ Features

### ✅ Form Model Management
- Create form templates
- Activate/deactivate models
- Search and filter models
- Track variant count

### ✅ Form Variant Management
- Multiple variants per model
- Set default variant
- Version control
- Track usage (ideas count)

### ✅ Form Field Management
- 10 field types supported
- Custom validation rules
- JSON-based options
- Field ordering (drag & drop friendly)
- Bulk field creation

### ✅ Dynamic Validation
- Runtime validation based on field configuration
- Type-specific validation
- Required field checks
- Choice validation for select/radio/checkbox
- Email and date validation

### ✅ Public API
- Get form structure without authentication
- Validate submissions
- Support for frontend form rendering

---

## 🏗️ Architecture

### Three-Layer Structure

```
FormModel (Template)
  ↓
FormVariant (Version)
  ↓
FormField (Individual Fields)
```

### Example Hierarchy

```
Form Model: "Idea Submission Form"
  ├─ Variant: "Standard Version" (default)
  │   ├─ Field 1: Title (TEXT, required)
  │   ├─ Field 2: Description (TEXTAREA, required)
  │   └─ Field 3: Category (SELECT, required)
  │
  └─ Variant: "Detailed Version"
      ├─ Field 1: Title (TEXT, required)
      ├─ Field 2: Description (TEXTAREA, required)
      ├─ Field 3: Category (SELECT, required)
      ├─ Field 4: Expected Benefits (TEXTAREA)
      └─ Field 5: Implementation Date (DATE)
```

---

## 🔌 API Endpoints

### Base URL
```
/api/v1/forms
```

### Endpoints Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| **FORM MODELS** |
| POST | `/models` | ✅ | Admin | Create form model |
| GET | `/models` | ✅ | All | List form models |
| GET | `/models/:id` | ✅ | All | Get form model |
| PUT | `/models/:id` | ✅ | Admin | Update form model |
| DELETE | `/models/:id` | ✅ | Admin | Delete form model |
| **FORM VARIANTS** |
| POST | `/variants` | ✅ | Admin/Manager | Create variant |
| GET | `/models/:modelId/variants` | ✅ | All | List variants |
| GET | `/variants/:id` | ✅ | All | Get variant |
| PUT | `/variants/:id` | ✅ | Admin/Manager | Update variant |
| DELETE | `/variants/:id` | ✅ | Admin | Delete variant |
| PATCH | `/models/:modelId/variants/:variantId/set-default` | ✅ | Admin/Manager | Set default |
| **FORM FIELDS** |
| POST | `/fields` | ✅ | Admin/Manager | Create field |
| GET | `/variants/:variantId/fields` | ✅ | All | List fields |
| GET | `/fields/:id` | ✅ | All | Get field |
| PUT | `/fields/:id` | ✅ | Admin/Manager | Update field |
| DELETE | `/fields/:id` | ✅ | Admin/Manager | Delete field |
| POST | `/variants/:variantId/fields/reorder` | ✅ | Admin/Manager | Reorder fields |
| POST | `/variants/:variantId/fields/bulk` | ✅ | Admin/Manager | Bulk create |
| **PUBLIC API** |
| GET | `/structure/:variantId` | ❌ | Public | Get form structure |
| GET | `/structure/default/:modelId` | ❌ | Public | Get default structure |
| POST | `/validate/:variantId` | ❌ | Public | Validate submission |

---

## 📝 Field Types

### Supported Field Types

| Type | Description | Validation | Options Required |
|------|-------------|------------|------------------|
| `TEXT` | Single-line text input | String | No |
| `TEXTAREA` | Multi-line text input | String | No |
| `NUMBER` | Numeric input | Number | No |
| `EMAIL` | Email input | Email format | No |
| `DATE` | Date picker | Date format | No |
| `SELECT` | Dropdown selection | Choice validation | Yes |
| `MULTISELECT` | Multiple selection dropdown | Array of choices | Yes |
| `CHECKBOX` | Multiple checkboxes | Array of choices | Yes |
| `RADIO` | Radio buttons | Single choice | Yes |
| `FILE` | File upload | File validation | No |

### Field Options Structure

For `SELECT`, `MULTISELECT`, `CHECKBOX`, and `RADIO` fields:

```json
{
  "options": {
    "choices": ["Option 1", "Option 2", "Option 3"]
  }
}
```

Additional options can be added:

```json
{
  "options": {
    "choices": ["Low", "Medium", "High"],
    "default": "Medium",
    "allowOther": true
  }
}
```

---

## 📊 Detailed Endpoint Documentation

### 1. Create Form Model

**POST** `/api/v1/forms/models`

**Auth:** Admin only

**Request Body:**
```json
{
  "name": "Idea Submission Form",
  "description": "Standard form for submitting new ideas",
  "isActive": true
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Form model created successfully",
  "data": {
    "formModel": {
      "id": "uuid",
      "name": "Idea Submission Form",
      "description": "Standard form for submitting new ideas",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z",
      "variants": []
    }
  }
}
```

---

### 2. Create Form Variant

**POST** `/api/v1/forms/variants`

**Auth:** Admin/Manager

**Request Body:**
```json
{
  "modelId": "uuid",
  "name": "Standard Version",
  "description": "Standard variant with basic fields",
  "isDefault": true,
  "isActive": true
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Form variant created successfully",
  "data": {
    "variant": {
      "id": "uuid",
      "modelId": "uuid",
      "name": "Standard Version",
      "description": "Standard variant with basic fields",
      "isDefault": true,
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z",
      "model": {
        "id": "uuid",
        "name": "Idea Submission Form"
      },
      "fields": []
    }
  }
}
```

---

### 3. Create Form Field

**POST** `/api/v1/forms/fields`

**Auth:** Admin/Manager

**Request Body (Text Field):**
```json
{
  "variantId": "uuid",
  "label": "Idea Title",
  "type": "TEXT",
  "required": true,
  "placeholder": "Enter a concise title for your idea",
  "helpText": "Keep it short and descriptive",
  "order": 1
}
```

**Request Body (Select Field):**
```json
{
  "variantId": "uuid",
  "label": "Category",
  "type": "SELECT",
  "required": true,
  "options": {
    "choices": ["Innovation", "Process Improvement", "Cost Reduction", "Technology"]
  },
  "placeholder": "Select a category",
  "helpText": "Choose the category that best fits your idea",
  "order": 2
}
```

**Request Body (Checkbox Field):**
```json
{
  "variantId": "uuid",
  "label": "Affected Departments",
  "type": "CHECKBOX",
  "required": false,
  "options": {
    "choices": ["Sales", "Marketing", "Engineering", "HR", "Finance"]
  },
  "helpText": "Select all departments that will be affected",
  "order": 3
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Form field created successfully",
  "data": {
    "field": {
      "id": "uuid",
      "variantId": "uuid",
      "label": "Idea Title",
      "type": "TEXT",
      "required": true,
      "options": null,
      "placeholder": "Enter a concise title for your idea",
      "helpText": "Keep it short and descriptive",
      "order": 1,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

---

### 4. Reorder Fields (Drag & Drop)

**POST** `/api/v1/forms/variants/:variantId/fields/reorder`

**Auth:** Admin/Manager

**Request Body:**
```json
{
  "fieldOrders": [
    { "id": "field-uuid-3", "order": 1 },
    { "id": "field-uuid-1", "order": 2 },
    { "id": "field-uuid-2", "order": 3 }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Fields reordered successfully",
  "data": {
    "fields": [
      {
        "id": "field-uuid-3",
        "label": "Category",
        "order": 1
      },
      {
        "id": "field-uuid-1",
        "label": "Title",
        "order": 2
      },
      {
        "id": "field-uuid-2",
        "label": "Description",
        "order": 3
      }
    ]
  }
}
```

---

### 5. Bulk Create Fields

**POST** `/api/v1/forms/variants/:variantId/fields/bulk`

**Auth:** Admin/Manager

**Request Body:**
```json
{
  "fields": [
    {
      "label": "Idea Title",
      "type": "TEXT",
      "required": true,
      "placeholder": "Enter title",
      "order": 1
    },
    {
      "label": "Description",
      "type": "TEXTAREA",
      "required": true,
      "placeholder": "Describe your idea",
      "order": 2
    },
    {
      "label": "Priority",
      "type": "SELECT",
      "required": true,
      "options": {
        "choices": ["Low", "Medium", "High", "Critical"]
      },
      "order": 3
    }
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Fields created successfully",
  "data": {
    "fields": [
      { "id": "uuid-1", "label": "Idea Title", "order": 1 },
      { "id": "uuid-2", "label": "Description", "order": 2 },
      { "id": "uuid-3", "label": "Priority", "order": 3 }
    ]
  }
}
```

---

### 6. Get Form Structure (Public)

**GET** `/api/v1/forms/structure/:variantId`

**Auth:** None (Public)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Form structure retrieved successfully",
  "data": {
    "structure": {
      "id": "uuid",
      "name": "Standard Version",
      "description": "Standard variant with basic fields",
      "isDefault": true,
      "isActive": true,
      "model": {
        "id": "uuid",
        "name": "Idea Submission Form",
        "description": "Standard form for submitting new ideas"
      },
      "fields": [
        {
          "id": "uuid-1",
          "label": "Idea Title",
          "type": "TEXT",
          "required": true,
          "placeholder": "Enter a concise title",
          "helpText": "Keep it short and descriptive",
          "order": 1
        },
        {
          "id": "uuid-2",
          "label": "Description",
          "type": "TEXTAREA",
          "required": true,
          "placeholder": "Describe your idea in detail",
          "helpText": "Provide as much detail as possible",
          "order": 2
        },
        {
          "id": "uuid-3",
          "label": "Category",
          "type": "SELECT",
          "required": true,
          "options": {
            "choices": ["Innovation", "Process Improvement", "Cost Reduction"]
          },
          "placeholder": "Select a category",
          "order": 3
        }
      ]
    }
  }
}
```

---

### 7. Validate Submission (Public)

**POST** `/api/v1/forms/validate/:variantId`

**Auth:** None (Public)

**Request Body:**
```json
{
  "submission": {
    "Idea Title": "Implement AI chatbot",
    "Description": "Use AI to handle customer queries automatically",
    "Category": "Innovation",
    "Priority": "High",
    "Email": "user@example.com"
  }
}
```

**Success Response (200) - Valid:**
```json
{
  "success": true,
  "message": "Submission is valid",
  "data": {
    "valid": true,
    "errors": [],
    "data": {
      "uuid-1": "Implement AI chatbot",
      "uuid-2": "Use AI to handle customer queries automatically",
      "uuid-3": "Innovation",
      "uuid-4": "High",
      "uuid-5": "user@example.com"
    }
  }
}
```

**Response (400) - Invalid:**
```json
{
  "success": true,
  "message": "Submission validation failed",
  "data": {
    "valid": false,
    "errors": [
      {
        "field": "Idea Title",
        "fieldId": "uuid-1",
        "message": "Idea Title is required"
      },
      {
        "field": "Email",
        "fieldId": "uuid-5",
        "message": "Email must be a valid email"
      },
      {
        "field": "Category",
        "fieldId": "uuid-3",
        "message": "Category must be one of: Innovation, Process Improvement, Cost Reduction"
      }
    ],
    "data": {}
  }
}
```

---

## 🎨 Form Structure

### Complete Form Structure

```javascript
{
  formModel: {
    id: "uuid",
    name: "Idea Submission Form",
    description: "Standard form for submitting ideas",
    isActive: true,
    variants: [
      {
        id: "uuid",
        name: "Standard Version",
        isDefault: true,
        isActive: true,
        fields: [
          {
            id: "uuid-1",
            label: "Title",
            type: "TEXT",
            required: true,
            order: 1
          },
          {
            id: "uuid-2",
            label: "Category",
            type: "SELECT",
            required: true,
            options: {
              choices: ["Innovation", "Process Improvement"]
            },
            order: 2
          }
        ]
      }
    ]
  }
}
```

---

## ✅ Dynamic Validation

### Validation Rules by Field Type

#### TEXT / TEXTAREA
- Required check
- String conversion

#### NUMBER
- Required check
- Numeric validation
- Type conversion to Number

#### EMAIL
- Required check
- Email format validation (regex)

#### DATE
- Required check
- Date format validation
- ISO 8601 conversion

#### SELECT / RADIO
- Required check
- Choice validation (must be in options.choices)

#### MULTISELECT / CHECKBOX
- Required check
- Array validation
- Each item must be in options.choices

#### FILE
- Handled separately during upload
- Metadata validation

### Example Validation Flow

```javascript
// 1. Get form structure
const structure = await getFormStructure(variantId);

// 2. Validate submission
const result = await validateSubmission(variantId, {
  "Title": "My Idea",
  "Category": "Innovation",
  "Priority": "HIGH",
  "Email": "user@example.com"
});

// 3. Check result
if (result.valid) {
  // Use validated data
  const validatedData = result.data;
  // Save to database
} else {
  // Show errors to user
  const errors = result.errors;
  // Display validation errors
}
```

---

## 🎯 Drag & Drop Support

### Reordering Fields

The reorder endpoint is designed to work seamlessly with drag-and-drop libraries:

**Frontend Example (React DnD):**

```javascript
const handleDragEnd = async (result) => {
  if (!result.destination) return;

  const items = Array.from(fields);
  const [reorderedItem] = items.splice(result.source.index, 1);
  items.splice(result.destination.index, 0, reorderedItem);

  // Update order values
  const fieldOrders = items.map((item, index) => ({
    id: item.id,
    order: index + 1,
  }));

  // Send to API
  await fetch(`/api/v1/forms/variants/${variantId}/fields/reorder`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fieldOrders }),
  });
};
```

**Frontend Example (Sortable.js):**

```javascript
const sortable = Sortable.create(fieldList, {
  animation: 150,
  onEnd: async (evt) => {
    const fieldOrders = Array.from(fieldList.children).map((el, index) => ({
      id: el.dataset.fieldId,
      order: index + 1,
    }));

    await fetch(`/api/v1/forms/variants/${variantId}/fields/reorder`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fieldOrders }),
    });
  },
});
```

---

## 💻 Usage Examples

### Complete Form Builder Workflow

```javascript
// 1. Create Form Model (Admin)
const modelResponse = await fetch('/api/v1/forms/models', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Idea Submission Form',
    description: 'Standard form for submitting ideas',
    isActive: true,
  }),
});
const { data: { formModel } } = await modelResponse.json();

// 2. Create Form Variant (Admin/Manager)
const variantResponse = await fetch('/api/v1/forms/variants', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    modelId: formModel.id,
    name: 'Standard Version',
    isDefault: true,
    isActive: true,
  }),
});
const { data: { variant } } = await variantResponse.json();

// 3. Bulk Create Fields (Admin/Manager)
const fieldsResponse = await fetch(`/api/v1/forms/variants/${variant.id}/fields/bulk`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fields: [
      {
        label: 'Idea Title',
        type: 'TEXT',
        required: true,
        placeholder: 'Enter title',
        order: 1,
      },
      {
        label: 'Description',
        type: 'TEXTAREA',
        required: true,
        placeholder: 'Describe your idea',
        order: 2,
      },
      {
        label: 'Category',
        type: 'SELECT',
        required: true,
        options: {
          choices: ['Innovation', 'Process Improvement', 'Cost Reduction'],
        },
        order: 3,
      },
    ],
  }),
});

// 4. Get Form Structure (Public - No Auth)
const structureResponse = await fetch(`/api/v1/forms/structure/${variant.id}`);
const { data: { structure } } = await structureResponse.json();

// 5. Render Form (Frontend)
structure.fields.forEach(field => {
  renderField(field);
});

// 6. Validate User Submission (Public - No Auth)
const validationResponse = await fetch(`/api/v1/forms/validate/${variant.id}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    submission: {
      'Idea Title': 'My Great Idea',
      'Description': 'This is a detailed description',
      'Category': 'Innovation',
    },
  }),
});
const { data: validationResult } = await validationResponse.json();

if (validationResult.valid) {
  // Submit to idea creation endpoint
  console.log('Valid data:', validationResult.data);
} else {
  // Show errors
  console.log('Errors:', validationResult.errors);
}
```

---

## 🔒 Permissions

### Role-Based Access

| Action | USER | MANAGER | ADMIN |
|--------|------|---------|-------|
| Create model | ❌ | ❌ | ✅ |
| Update model | ❌ | ❌ | ✅ |
| Delete model | ❌ | ❌ | ✅ |
| Create variant | ❌ | ✅ | ✅ |
| Update variant | ❌ | ✅ | ✅ |
| Delete variant | ❌ | ❌ | ✅ |
| Create field | ❌ | ✅ | ✅ |
| Update field | ❌ | ✅ | ✅ |
| Delete field | ❌ | ✅ | ✅ |
| Reorder fields | ❌ | ✅ | ✅ |
| View all | ✅ | ✅ | ✅ |
| Get structure (public) | ✅ | ✅ | ✅ |
| Validate (public) | ✅ | ✅ | ✅ |

---

## 🧪 Testing

### Test Workflow

```bash
# 1. Login as admin
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ideabox.com", "password": "Admin@123"}'

# 2. Create form model
curl -X POST http://localhost:3000/api/v1/forms/models \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Form",
    "description": "Test form model"
  }'

# 3. Create variant
curl -X POST http://localhost:3000/api/v1/forms/variants \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "modelId": "MODEL_UUID",
    "name": "Test Variant",
    "isDefault": true
  }'

# 4. Create fields
curl -X POST http://localhost:3000/api/v1/forms/fields \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "variantId": "VARIANT_UUID",
    "label": "Test Field",
    "type": "TEXT",
    "required": true,
    "order": 1
  }'

# 5. Get form structure (no auth required)
curl -X GET http://localhost:3000/api/v1/forms/structure/VARIANT_UUID

# 6. Validate submission (no auth required)
curl -X POST http://localhost:3000/api/v1/forms/validate/VARIANT_UUID \
  -H "Content-Type: application/json" \
  -d '{
    "submission": {
      "Test Field": "Test Value"
    }
  }'
```

---

## 🚀 Best Practices

1. **Use default variants** - Always have one default variant per model
2. **Order fields logically** - Put required fields first
3. **Provide help text** - Guide users with clear instructions
4. **Validate on frontend** - Use form structure to validate before submission
5. **Cache form structures** - Reduce API calls by caching structures
6. **Version your forms** - Create new variants instead of modifying existing ones
7. **Test validation** - Always test validation rules before deploying
8. **Use bulk operations** - Use bulk create for multiple fields
9. **Handle errors gracefully** - Show clear validation errors to users
10. **Document field options** - Clearly document what options mean

---

**Last Updated:** 2024
**Module Version:** 1.0.0
