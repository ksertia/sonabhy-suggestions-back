# Database Schema Documentation - Idea Box

Complete documentation of the Prisma database schema for the Idea Box application.

## 📊 Schema Overview

The database consists of **11 models** organized into 5 functional areas:

1. **User & Authentication** (2 models)
2. **Idea Management** (3 models)
3. **Action Planning** (1 model)
4. **Dynamic Forms** (3 models)
5. **File Management** (1 model)
6. **Collaboration** (1 model)

---

## 🔐 User & Authentication

### User Model

Stores user account information and authentication data.

```prisma
model User {
  id            String         @id @default(uuid())
  firstname     String
  lastname      String
  email         String         @unique
  password      String         // Hashed with bcrypt
  role          Role           @default(USER)
  isActive      Boolean        @default(true)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  
  // Relations
  refreshTokens RefreshToken[]
  ideas         Idea[]
  comments      Comment[]
  assignedActions PlanAction[] @relation("AssignedActions")
}
```

**Fields:**
- `id` - UUID primary key
- `firstname` - User's first name
- `lastname` - User's last name
- `email` - Unique email address (indexed)
- `password` - Bcrypt hashed password
- `role` - USER, MANAGER, or ADMIN
- `isActive` - Account activation status
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

**Relations:**
- Has many `RefreshToken` (for JWT authentication)
- Has many `Idea` (ideas created by user)
- Has many `Comment` (comments made by user)
- Has many `PlanAction` (actions assigned to user)

**Cascade Rules:**
- Deleting a user cascades to: RefreshTokens, Comments
- Deleting a user sets NULL on: Ideas (if not anonymous), PlanActions

---

### RefreshToken Model

Stores JWT refresh tokens for authentication.

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

**Fields:**
- `id` - UUID primary key
- `token` - Unique JWT refresh token (indexed)
- `userId` - Foreign key to User
- `expiresAt` - Token expiration date
- `createdAt` - Token creation timestamp

**Cascade Rules:**
- Deleting a user deletes all their refresh tokens

---

## 💡 Idea Management

### Idea Model

Core model for storing user-submitted ideas.

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
  
  // Relations
  category      Category    @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  status        Status      @relation(fields: [statusId], references: [id], onDelete: Restrict)
  user          User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  formVariant   FormVariant @relation(fields: [formVariantId], references: [id], onDelete: Restrict)
  metadata      FileMetadata? @relation(fields: [metadataId], references: [id], onDelete: SetNull)
  planActions   PlanAction[]
  comments      Comment[]
}
```

**Fields:**
- `id` - UUID primary key
- `title` - Idea title
- `description` - Detailed description (text field)
- `categoryId` - Foreign key to Category (indexed)
- `statusId` - Foreign key to Status (indexed)
- `urgency` - LOW, MEDIUM, HIGH, CRITICAL
- `impact` - LOW, MEDIUM, HIGH, VERY_HIGH
- `isAnonymous` - Whether idea is submitted anonymously
- `userId` - Foreign key to User (nullable for anonymous ideas, indexed)
- `formVariantId` - Foreign key to FormVariant (indexed)
- `metadataId` - Foreign key to FileMetadata (optional, unique)
- `createdAt` - Idea submission timestamp (indexed)
- `updatedAt` - Last update timestamp

**Relations:**
- Belongs to `Category` (cannot delete category if ideas exist)
- Belongs to `Status` (cannot delete status if ideas exist)
- Belongs to `User` (optional, set NULL on user deletion)
- Belongs to `FormVariant` (cannot delete variant if ideas exist)
- Has one `FileMetadata` (optional attachment)
- Has many `PlanAction`
- Has many `Comment`

**Cascade Rules:**
- Deleting an idea cascades to: PlanActions, Comments
- Category/Status/FormVariant cannot be deleted if referenced
- User deletion sets userId to NULL
- FileMetadata deletion sets metadataId to NULL

---

### Category Model

Categorizes ideas into different types.

```prisma
model Category {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  ideas       Idea[]
}
```

**Fields:**
- `id` - UUID primary key
- `name` - Unique category name
- `description` - Optional category description
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relations:**
- Has many `Idea`

**Cascade Rules:**
- Cannot be deleted if ideas exist (Restrict)

**Default Categories:**
- Innovation
- Process Improvement
- Cost Reduction
- Customer Experience
- Technology

---

### Status Model

Tracks the lifecycle status of ideas.

```prisma
model Status {
  id          String   @id @default(uuid())
  name        String   @unique
  order       Int      @unique
  color       String?
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  ideas       Idea[]
}
```

**Fields:**
- `id` - UUID primary key
- `name` - Unique status name
- `order` - Display order (unique, indexed)
- `color` - Hex color code for UI
- `description` - Optional status description
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relations:**
- Has many `Idea`

**Cascade Rules:**
- Cannot be deleted if ideas exist (Restrict)

**Default Statuses:**
1. Submitted (#3B82F6)
2. Under Review (#F59E0B)
3. Approved (#10B981)
4. In Progress (#8B5CF6)
5. Completed (#059669)
6. Rejected (#EF4444)

---

## 📋 Action Planning

### PlanAction Model

Tracks action items for implementing ideas.

```prisma
model PlanAction {
  id          String    @id @default(uuid())
  ideaId      String
  title       String
  description String?   @db.Text
  progress    Int       @default(0)
  deadline    DateTime?
  assignedTo  String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  idea        Idea      @relation(fields: [ideaId], references: [id], onDelete: Cascade)
  assignee    User?     @relation("AssignedActions", fields: [assignedTo], references: [id], onDelete: SetNull)
}
```

**Fields:**
- `id` - UUID primary key
- `ideaId` - Foreign key to Idea (indexed)
- `title` - Action title
- `description` - Optional detailed description
- `progress` - Progress percentage (0-100)
- `deadline` - Optional deadline (indexed)
- `assignedTo` - Foreign key to User (optional, indexed)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relations:**
- Belongs to `Idea`
- Belongs to `User` (assignee, optional)

**Cascade Rules:**
- Deleting an idea deletes all its actions
- Deleting a user sets assignedTo to NULL

---

## 📝 Dynamic Forms

### FormModel Model

Defines form templates for idea submission.

```prisma
model FormModel {
  id          String        @id @default(uuid())
  name        String        @unique
  description String?       @db.Text
  isActive    Boolean       @default(true)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  variants    FormVariant[]
}
```

**Fields:**
- `id` - UUID primary key
- `name` - Unique form model name
- `description` - Optional description
- `isActive` - Whether form is active
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relations:**
- Has many `FormVariant`

**Cascade Rules:**
- Deleting a form model cascades to all its variants

---

### FormVariant Model

Different versions/variants of a form model.

```prisma
model FormVariant {
  id          String      @id @default(uuid())
  modelId     String
  name        String
  description String?     @db.Text
  isDefault   Boolean     @default(false)
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  model       FormModel   @relation(fields: [modelId], references: [id], onDelete: Cascade)
  fields      FormField[]
  ideas       Idea[]
}
```

**Fields:**
- `id` - UUID primary key
- `modelId` - Foreign key to FormModel (indexed)
- `name` - Variant name (unique per model)
- `description` - Optional description
- `isDefault` - Whether this is the default variant
- `isActive` - Whether variant is active
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relations:**
- Belongs to `FormModel`
- Has many `FormField`
- Has many `Idea`

**Cascade Rules:**
- Deleting a form model deletes all its variants
- Deleting a variant cascades to all its fields
- Cannot delete variant if ideas exist (Restrict)

**Unique Constraint:**
- (modelId, name) must be unique

---

### FormField Model

Individual fields within a form variant.

```prisma
model FormField {
  id          String      @id @default(uuid())
  variantId   String
  label       String
  type        FieldType
  required    Boolean     @default(false)
  options     Json?
  placeholder String?
  helpText    String?
  order       Int
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  variant     FormVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
}
```

**Fields:**
- `id` - UUID primary key
- `variantId` - Foreign key to FormVariant (indexed)
- `label` - Field label
- `type` - Field type (TEXT, TEXTAREA, NUMBER, EMAIL, DATE, SELECT, etc.)
- `required` - Whether field is required
- `options` - JSON field for field-specific options (e.g., select choices)
- `placeholder` - Placeholder text
- `helpText` - Help text for users
- `order` - Display order (unique per variant)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relations:**
- Belongs to `FormVariant`

**Cascade Rules:**
- Deleting a variant deletes all its fields

**Unique Constraint:**
- (variantId, order) must be unique

**Field Types:**
- TEXT
- TEXTAREA
- NUMBER
- EMAIL
- DATE
- SELECT
- MULTISELECT
- CHECKBOX
- RADIO
- FILE

---

## 📁 File Management

### FileMetadata Model

Stores metadata for uploaded files.

```prisma
model FileMetadata {
  id            String   @id @default(uuid())
  originalName  String
  storageName   String   @unique
  mimeType      String
  size          Int
  path          String
  uploadedById  String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  idea          Idea?
}
```

**Fields:**
- `id` - UUID primary key
- `originalName` - Original filename
- `storageName` - Unique storage filename (indexed)
- `mimeType` - MIME type
- `size` - File size in bytes
- `path` - Storage path
- `uploadedById` - Foreign key to User (optional)
- `createdAt` - Upload timestamp
- `updatedAt` - Last update timestamp

**Relations:**
- Has one `Idea` (optional, reverse relation)

**Cascade Rules:**
- Can exist independently of ideas
- Deleting file metadata sets idea.metadataId to NULL

---

## 💬 Collaboration

### Comment Model

User comments on ideas.

```prisma
model Comment {
  id          String   @id @default(uuid())
  ideaId      String
  userId      String
  content     String   @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  idea        Idea     @relation(fields: [ideaId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Fields:**
- `id` - UUID primary key
- `ideaId` - Foreign key to Idea (indexed)
- `userId` - Foreign key to User (indexed)
- `content` - Comment text
- `createdAt` - Comment timestamp (indexed)
- `updatedAt` - Last update timestamp

**Relations:**
- Belongs to `Idea`
- Belongs to `User`

**Cascade Rules:**
- Deleting an idea deletes all its comments
- Deleting a user deletes all their comments

---

## 🔗 Relationship Summary

### One-to-Many Relationships

| Parent | Child | Cascade Rule |
|--------|-------|--------------|
| User | RefreshToken | Cascade |
| User | Idea | SetNull |
| User | Comment | Cascade |
| User | PlanAction (assignee) | SetNull |
| Category | Idea | Restrict |
| Status | Idea | Restrict |
| FormModel | FormVariant | Cascade |
| FormVariant | FormField | Cascade |
| FormVariant | Idea | Restrict |
| Idea | PlanAction | Cascade |
| Idea | Comment | Cascade |

### One-to-One Relationships

| Model A | Model B | Cascade Rule |
|---------|---------|--------------|
| FileMetadata | Idea | SetNull |

---

## 📈 Indexes

Performance indexes for common queries:

```
users:
  - email (unique)

refresh_tokens:
  - userId
  - token (unique)

ideas:
  - categoryId
  - statusId
  - userId
  - formVariantId
  - createdAt

statuses:
  - order (unique)

plan_actions:
  - ideaId
  - assignedTo
  - deadline

form_variants:
  - modelId

form_fields:
  - variantId

file_metadata:
  - storageName (unique)

comments:
  - ideaId
  - userId
  - createdAt
```

---

## 🎯 Enums

### Role
```prisma
enum Role {
  USER      // Regular user
  MANAGER   // Manager with elevated permissions
  ADMIN     // Administrator with full access
}
```

### Urgency
```prisma
enum Urgency {
  LOW       // Low urgency
  MEDIUM    // Medium urgency
  HIGH      // High urgency
  CRITICAL  // Critical urgency
}
```

### Impact
```prisma
enum Impact {
  LOW       // Low impact
  MEDIUM    // Medium impact
  HIGH      // High impact
  VERY_HIGH // Very high impact
}
```

### FieldType
```prisma
enum FieldType {
  TEXT          // Single-line text input
  TEXTAREA      // Multi-line text input
  NUMBER        // Numeric input
  EMAIL         // Email input
  DATE          // Date picker
  SELECT        // Dropdown select
  MULTISELECT   // Multiple selection
  CHECKBOX      // Checkbox
  RADIO         // Radio buttons
  FILE          // File upload
}
```

---

## 🔄 Migration Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Apply migrations
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database
npm run prisma:seed

# Open Prisma Studio
npm run prisma:studio
```

---

## 📊 Entity Relationship Diagram

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       ├──1:N──► RefreshToken
       ├──1:N──► Idea (userId nullable)
       ├──1:N──► Comment
       └──1:N──► PlanAction (assignee)

┌─────────────┐
│    Idea     │
└──────┬──────┘
       │
       ├──N:1──► Category
       ├──N:1──► Status
       ├──N:1──► User (optional)
       ├──N:1──► FormVariant
       ├──1:1──► FileMetadata (optional)
       ├──1:N──► PlanAction
       └──1:N──► Comment

┌─────────────┐
│  FormModel  │
└──────┬──────┘
       │
       └──1:N──► FormVariant
                      │
                      ├──1:N──► FormField
                      └──1:N──► Idea
```

---

## 💾 Database Size Estimates

Approximate storage per record:

| Model | Avg Size | Notes |
|-------|----------|-------|
| User | 500 bytes | Including password hash |
| RefreshToken | 300 bytes | JWT token string |
| Idea | 2 KB | With description |
| Category | 200 bytes | Simple lookup |
| Status | 200 bytes | Simple lookup |
| PlanAction | 1 KB | With description |
| FormModel | 500 bytes | Template definition |
| FormVariant | 500 bytes | Variant definition |
| FormField | 400 bytes | Field configuration |
| FileMetadata | 300 bytes | Metadata only |
| Comment | 500 bytes | Average comment |

---

## 🔒 Security Considerations

1. **Password Storage**: Always hashed with bcrypt (10 rounds)
2. **Soft Delete**: Consider adding `deletedAt` for soft deletes
3. **Audit Trail**: All models have `createdAt` and `updatedAt`
4. **Anonymous Ideas**: `userId` is nullable for anonymous submissions
5. **File Validation**: Validate file types and sizes before upload
6. **JSON Fields**: Validate JSON structure for `FormField.options`

---

## 📝 Best Practices

1. **Use Transactions** for operations affecting multiple tables
2. **Validate Enums** on the application layer
3. **Index Foreign Keys** for better query performance
4. **Use Pagination** for large result sets
5. **Soft Delete** for important data (add `deletedAt` field)
6. **Audit Logging** for sensitive operations
7. **Backup Regularly** especially before migrations

---

**Last Updated:** 2024
**Schema Version:** 2.0.0
**Prisma Version:** 5.22.0
