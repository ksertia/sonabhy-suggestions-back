# Setup Guide for Idea Box Backend

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd idea-box-backend
npm install
```

### 2. Configure Environment Variables

Copy the `.env.example` file to create your `.env` file:

```bash
cp .env.example .env
```

Then edit the `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1

# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://username:password@localhost:5432/idea_box_db?schema=public"

# JWT Configuration - Generate secure random strings for production
JWT_ACCESS_SECRET=your-super-secret-access-token-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 3. Set Up PostgreSQL Database

Create a new PostgreSQL database:

```sql
CREATE DATABASE idea_box_db;
```

Or using psql command line:

```bash
psql -U postgres
CREATE DATABASE idea_box_db;
\q
```

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Run Database Migrations

```bash
npm run prisma:migrate
```

When prompted, enter a name for the migration (e.g., "init").

### 6. Seed the Database (Optional)

This will create test users with different roles:

```bash
npm run prisma:seed
```

**Test Credentials:**
- **Admin:** admin@ideabox.com / Admin@123
- **Manager:** manager@ideabox.com / Manager@123
- **User:** user@ideabox.com / User@123

### 7. Start the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start at `http://localhost:3000`

### 8. Access API Documentation

Open your browser and navigate to:
```
http://localhost:3000/api-docs
```

## Project Structure

```
idea-box-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.js                # Database seeding script
├── src/
│   ├── config/
│   │   ├── database.js        # Prisma client configuration
│   │   └── swagger.js         # Swagger/OpenAPI configuration
│   ├── modules/
│   │   ├── auth/              # Authentication module
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.repository.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.validation.js
│   │   ├── users/             # User management module
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   ├── user.repository.js
│   │   │   ├── user.routes.js
│   │   │   └── user.validation.js
│   │   └── files/             # File upload module
│   │       ├── file.controller.js
│   │       ├── file.service.js
│   │       ├── file.repository.js
│   │       ├── file.routes.js
│   │       └── file.validation.js
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT authentication
│   │   ├── rbac.middleware.js      # Role-based access control
│   │   ├── error.middleware.js     # Global error handler
│   │   ├── validation.middleware.js # Request validation
│   │   └── upload.middleware.js    # File upload handling
│   ├── utils/
│   │   ├── errors.js          # Custom error classes
│   │   ├── jwt.js             # JWT utilities
│   │   └── response.js        # Response helpers
│   ├── app.js                 # Express app configuration
│   └── index.js               # Server entry point
├── uploads/                   # File upload directory (auto-created)
├── .env                       # Environment variables (create from .env.example)
├── .env.example               # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints Overview

### Authentication (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /refresh` - Refresh access token
- `POST /logout` - Logout user
- `GET /profile` - Get current user profile (requires auth)

### Users (`/api/v1/users`)
- `GET /` - Get all users (Admin only)
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user (Admin only)

### Files (`/api/v1/files`)
- `POST /upload` - Upload file
- `GET /` - Get all files (filtered by role)
- `GET /:id` - Get file by ID
- `GET /:id/download` - Download file
- `DELETE /:id` - Delete file

## Testing the API

### 1. Register a New User

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

### 2. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

Save the `accessToken` from the response.

### 3. Access Protected Route

```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Upload a File

```bash
curl -X POST http://localhost:3000/api/v1/files/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/your/file.pdf"
```

## Role-Based Access Control

### USER Role
- Can view and update their own profile
- Can upload files
- Can view, download, and delete their own files

### MANAGER Role
- All USER permissions
- Can view all files uploaded by any user

### ADMIN Role
- All MANAGER permissions
- Can view all users
- Can update any user's profile
- Can delete any user (except themselves)
- Can delete any file

## Database Management

### View Database with Prisma Studio

```bash
npm run prisma:studio
```

This opens a GUI at `http://localhost:5555` to view and edit your database.

### Create a New Migration

After modifying `prisma/schema.prisma`:

```bash
npm run prisma:migrate
```

### Reset Database (WARNING: Deletes all data)

```bash
npx prisma migrate reset
```

## Troubleshooting

### Database Connection Issues

1. Verify PostgreSQL is running
2. Check DATABASE_URL in `.env` file
3. Ensure database exists: `psql -U postgres -l`

### Port Already in Use

Change the PORT in `.env` file or kill the process using port 3000:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Prisma Client Issues

Regenerate the Prisma client:

```bash
npm run prisma:generate
```

## Production Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong random secrets for JWT_ACCESS_SECRET and JWT_REFRESH_SECRET
- [ ] Use a production PostgreSQL database
- [ ] Set appropriate CORS_ORIGIN
- [ ] Configure file upload limits based on your needs
- [ ] Set up proper logging
- [ ] Configure SSL/TLS for database connection
- [ ] Set up monitoring and error tracking
- [ ] Use environment-specific configuration management
- [ ] Implement rate limiting
- [ ] Set up automated backups for database

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## Support

For issues and questions, please refer to the README.md or create an issue in the project repository.
