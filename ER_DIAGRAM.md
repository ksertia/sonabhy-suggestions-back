# Entity Relationship Diagram - Idea Box

Visual representation of the database schema and relationships.

## 🎨 Complete ER Diagram

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                           IDEA BOX DATABASE SCHEMA                              │
└────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                          USER & AUTHENTICATION                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

        ┌──────────────────────────┐
        │         User             │
        ├──────────────────────────┤
        │ PK  id (UUID)            │
        │     firstname            │
        │     lastname             │
        │ UK  email                │
        │     password (hashed)    │
        │     role (enum)          │
        │     isActive             │
        │     createdAt            │
        │     updatedAt            │
        └──────────┬───────────────┘
                   │
                   │ 1:N
                   │
        ┌──────────▼───────────────┐
        │    RefreshToken          │
        ├──────────────────────────┤
        │ PK  id (UUID)            │
        │ UK  token                │
        │ FK  userId               │
        │     expiresAt            │
        │     createdAt            │
        └──────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                           IDEA MANAGEMENT                                        │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐              ┌──────────────────────────┐
│    Category      │              │         Idea             │
├──────────────────┤              ├──────────────────────────┤
│ PK  id (UUID)    │◄─────N:1─────│ PK  id (UUID)            │
│ UK  name         │              │     title                │
│     description  │              │     description (text)   │
│     createdAt    │              │ FK  categoryId           │
│     updatedAt    │              │ FK  statusId             │
└──────────────────┘              │     urgency (enum)       │
                                  │     impact (enum)        │
┌──────────────────┐              │     isAnonymous          │
│     Status       │              │ FK  userId (nullable)    │
├──────────────────┤              │ FK  formVariantId        │
│ PK  id (UUID)    │◄─────N:1─────│ FK  metadataId (unique)  │
│ UK  name         │              │     createdAt            │
│ UK  order        │              │     updatedAt            │
│     color        │              └──────────┬───────────────┘
│     description  │                         │
│     createdAt    │                         │
│     updatedAt    │                         │
└──────────────────┘                         │
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
                    │ 1:N                    │ 1:N                    │ 1:1
                    │                        │                        │
        ┌───────────▼──────────┐  ┌─────────▼────────┐  ┌───────────▼──────────┐
        │    PlanAction        │  │     Comment      │  │    FileMetadata      │
        ├──────────────────────┤  ├──────────────────┤  ├──────────────────────┤
        │ PK  id (UUID)        │  │ PK  id (UUID)    │  │ PK  id (UUID)        │
        │ FK  ideaId           │  │ FK  ideaId       │  │     originalName     │
        │     title            │  │ FK  userId       │  │ UK  storageName      │
        │     description      │  │     content      │  │     mimeType         │
        │     progress (0-100) │  │     createdAt    │  │     size             │
        │     deadline         │  │     updatedAt    │  │     path             │
        │ FK  assignedTo       │  └──────────────────┘  │     uploadedById     │
        │     createdAt        │                        │     createdAt        │
        │     updatedAt        │                        │     updatedAt        │
        └──────────────────────┘                        └──────────────────────┘
                   │
                   │ N:1
                   │
        ┌──────────▼───────────┐
        │       User           │
        │   (assignee)         │
        └──────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DYNAMIC FORMS                                          │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│     FormModel        │
├──────────────────────┤
│ PK  id (UUID)        │
│ UK  name             │
│     description      │
│     isActive         │
│     createdAt        │
│     updatedAt        │
└──────────┬───────────┘
           │
           │ 1:N
           │
┌──────────▼───────────┐
│    FormVariant       │
├──────────────────────┤
│ PK  id (UUID)        │
│ FK  modelId          │
│     name             │◄────────N:1────────┐
│     description      │                    │
│     isDefault        │                    │
│     isActive         │                    │
│     createdAt        │                    │
│     updatedAt        │                    │
└──────────┬───────────┘                    │
           │                                │
           │ 1:N                            │
           │                         ┌──────┴──────┐
┌──────────▼───────────┐             │    Idea     │
│     FormField        │             └─────────────┘
├──────────────────────┤
│ PK  id (UUID)        │
│ FK  variantId        │
│     label            │
│     type (enum)      │
│     required         │
│     options (JSON)   │
│     placeholder      │
│     helpText         │
│     order            │
│     createdAt        │
│     updatedAt        │
└──────────────────────┘

UK = Unique Key
```

---

## 🔗 Relationship Details

### User Relationships

```
User (1) ──────► (N) RefreshToken
  └─ Cascade: Delete user → Delete all tokens

User (1) ──────► (N) Idea
  └─ SetNull: Delete user → Set idea.userId = NULL

User (1) ──────► (N) Comment
  └─ Cascade: Delete user → Delete all comments

User (1) ──────► (N) PlanAction (as assignee)
  └─ SetNull: Delete user → Set action.assignedTo = NULL
```

### Idea Relationships

```
Category (1) ──────► (N) Idea
  └─ Restrict: Cannot delete category if ideas exist

Status (1) ──────► (N) Idea
  └─ Restrict: Cannot delete status if ideas exist

FormVariant (1) ──────► (N) Idea
  └─ Restrict: Cannot delete variant if ideas exist

Idea (1) ──────► (N) PlanAction
  └─ Cascade: Delete idea → Delete all actions

Idea (1) ──────► (N) Comment
  └─ Cascade: Delete idea → Delete all comments

Idea (1) ──────► (1) FileMetadata
  └─ SetNull: Delete file → Set idea.metadataId = NULL
```

### Form Relationships

```
FormModel (1) ──────► (N) FormVariant
  └─ Cascade: Delete model → Delete all variants

FormVariant (1) ──────► (N) FormField
  └─ Cascade: Delete variant → Delete all fields
```

---

## 📊 Cardinality Summary

| Relationship | Type | Parent | Child | Delete Rule |
|--------------|------|--------|-------|-------------|
| User → RefreshToken | 1:N | User | RefreshToken | CASCADE |
| User → Idea | 1:N | User | Idea | SET NULL |
| User → Comment | 1:N | User | Comment | CASCADE |
| User → PlanAction | 1:N | User | PlanAction | SET NULL |
| Category → Idea | 1:N | Category | Idea | RESTRICT |
| Status → Idea | 1:N | Status | Idea | RESTRICT |
| FormVariant → Idea | 1:N | FormVariant | Idea | RESTRICT |
| Idea → PlanAction | 1:N | Idea | PlanAction | CASCADE |
| Idea → Comment | 1:N | Idea | Comment | CASCADE |
| Idea → FileMetadata | 1:1 | Idea | FileMetadata | SET NULL |
| FormModel → FormVariant | 1:N | FormModel | FormVariant | CASCADE |
| FormVariant → FormField | 1:N | FormVariant | FormField | CASCADE |

---

## 🎯 Cascade Behavior

### CASCADE (Delete parent → Delete children)
- User → RefreshToken
- User → Comment
- Idea → PlanAction
- Idea → Comment
- FormModel → FormVariant
- FormVariant → FormField

### SET NULL (Delete parent → Set FK to NULL)
- User → Idea (userId)
- User → PlanAction (assignedTo)
- FileMetadata → Idea (metadataId)

### RESTRICT (Cannot delete parent if children exist)
- Category → Idea
- Status → Idea
- FormVariant → Idea

---

## 🔍 Key Indexes

```
Performance Indexes:

users:
  - email (UNIQUE, B-tree)

refresh_tokens:
  - token (UNIQUE, B-tree)
  - userId (B-tree)

ideas:
  - categoryId (B-tree)
  - statusId (B-tree)
  - userId (B-tree)
  - formVariantId (B-tree)
  - createdAt (B-tree)

statuses:
  - order (UNIQUE, B-tree)

plan_actions:
  - ideaId (B-tree)
  - assignedTo (B-tree)
  - deadline (B-tree)

form_variants:
  - modelId (B-tree)
  - (modelId, name) (UNIQUE, Composite)

form_fields:
  - variantId (B-tree)
  - (variantId, order) (UNIQUE, Composite)

file_metadata:
  - storageName (UNIQUE, B-tree)

comments:
  - ideaId (B-tree)
  - userId (B-tree)
  - createdAt (B-tree)
```

---

## 📈 Data Flow Diagram

### Idea Submission Flow

```
1. User submits idea
   │
   ├─► Select Category
   ├─► Select FormVariant
   ├─► Fill form fields (defined by FormVariant)
   ├─► Set urgency & impact
   ├─► Optional: Attach file (FileMetadata)
   └─► Submit (Status = "Submitted")

2. Idea created
   │
   ├─► Linked to User (or anonymous)
   ├─► Linked to Category
   ├─► Linked to Status
   ├─► Linked to FormVariant
   └─► Optional: Linked to FileMetadata

3. Idea lifecycle
   │
   ├─► Status changes (Submitted → Under Review → Approved → In Progress → Completed)
   ├─► Comments added by users
   ├─► PlanActions created and assigned
   └─► Progress tracked
```

### User Authentication Flow

```
1. User registers
   │
   └─► User record created (password hashed)

2. User logs in
   │
   ├─► Credentials verified
   ├─► Access token generated (15 min)
   └─► Refresh token generated (7 days) → Stored in RefreshToken table

3. Token refresh
   │
   ├─► Refresh token validated
   ├─► New access token generated
   └─► User continues session

4. User logs out
   │
   └─► Refresh token deleted from database
```

---

## 🏗️ Schema Evolution

### Version History

**v1.0.0** - Initial schema
- User, RefreshToken, File models

**v2.0.0** - Idea Box schema
- Added: Idea, Category, Status
- Added: PlanAction
- Added: FormModel, FormVariant, FormField
- Added: FileMetadata (renamed from File)
- Added: Comment
- Updated: User (firstname/lastname instead of firstName/lastName)

---

## 💡 Design Decisions

### Why UUID for Primary Keys?
- Distributed system friendly
- No sequential ID leakage
- Better for merging databases
- Unique across tables

### Why Separate Category and Status?
- Categories: Business domain classification
- Statuses: Workflow state machine
- Different lifecycle and management

### Why Dynamic Forms?
- Flexibility for different idea types
- No schema changes for new fields
- Support multiple form templates
- Easy A/B testing of forms

### Why FileMetadata separate from Idea?
- Files can exist independently
- Reusable file references
- Easier file management
- Optional attachment

### Why isAnonymous flag?
- Support anonymous idea submission
- userId can be NULL for anonymous
- Still track submission metadata
- Privacy-friendly

---

## 🔐 Security Considerations

### Sensitive Data
- `User.password` - Always hashed (bcrypt)
- `RefreshToken.token` - JWT, stored securely
- `User.email` - PII, handle with care

### Audit Trail
All models have:
- `createdAt` - When record was created
- `updatedAt` - When record was last modified

### Soft Delete Consideration
Consider adding `deletedAt` to:
- User (for account deactivation)
- Idea (for archival)
- Comment (for moderation)

---

## 📊 Sample Queries

### Get all ideas with full details
```sql
SELECT 
  i.*,
  c.name as category_name,
  s.name as status_name,
  u.firstname, u.lastname,
  fv.name as form_variant_name
FROM ideas i
LEFT JOIN categories c ON i.categoryId = c.id
LEFT JOIN statuses s ON i.statusId = s.id
LEFT JOIN users u ON i.userId = u.id
LEFT JOIN form_variants fv ON i.formVariantId = fv.id
ORDER BY i.createdAt DESC;
```

### Get user's ideas with action counts
```sql
SELECT 
  i.*,
  COUNT(pa.id) as action_count,
  COUNT(co.id) as comment_count
FROM ideas i
LEFT JOIN plan_actions pa ON i.id = pa.ideaId
LEFT JOIN comments co ON i.id = co.ideaId
WHERE i.userId = ?
GROUP BY i.id;
```

### Get form structure
```sql
SELECT 
  fm.name as model_name,
  fv.name as variant_name,
  ff.label,
  ff.type,
  ff.required,
  ff.order
FROM form_models fm
JOIN form_variants fv ON fm.id = fv.modelId
JOIN form_fields ff ON fv.id = ff.variantId
WHERE fv.isDefault = true
ORDER BY ff.order;
```

---

**Last Updated:** 2024
**Schema Version:** 2.0.0
