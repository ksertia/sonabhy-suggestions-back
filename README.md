# Idea Box Backend

A production-ready REST API built with Express.js, Prisma, and PostgreSQL featuring JWT authentication, role-based access control, and file upload capabilities.

## Features

- ✅ **Clean Architecture**: Modular structure with controllers, services, and repositories
- ✅ **JWT Authentication**: Access tokens + refresh tokens
- ✅ **Role-Based Access Control**: USER, MANAGER, ADMIN roles
- ✅ **File Upload**: Disk storage with metadata in database
- ✅ **API Documentation**: Swagger/OpenAPI 3.0
- ✅ **Request Validation**: Zod schema validation
- ✅ **Error Handling**: Global error handler with custom error classes
- ✅ **Security**: Helmet, CORS, bcrypt password hashing

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **File Upload**: Multer
- **Documentation**: Swagger UI

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update the `DATABASE_URL` in `.env` with your PostgreSQL credentials

5. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

6. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

7. (Optional) Seed the database:
   ```bash
   npm run prisma:seed
   ```

### Running the Application

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The API will be available at `http://localhost:3000`

## API Documentation

Once the server is running, access the Swagger documentation at:
```
http://localhost:3000/api-docs
```

## Project Structure

```
idea-box-backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── swagger.js
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.repository.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.validation.js
│   │   ├── users/
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   ├── user.repository.js
│   │   │   ├── user.routes.js
│   │   │   └── user.validation.js
│   │   └── files/
│   │       ├── file.controller.js
│   │       ├── file.service.js
│   │       ├── file.repository.js
│   │       ├── file.routes.js
│   │       └── file.validation.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── rbac.middleware.js
│   │   ├── error.middleware.js
│   │   ├── validation.middleware.js
│   │   └── upload.middleware.js
│   ├── utils/
│   │   ├── errors.js
│   │   ├── jwt.js
│   │   └── response.js
│   ├── app.js
│   └── index.js
├── uploads/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user

### Users (Protected)
- `GET /api/v1/users` - Get all users (ADMIN only)
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user (ADMIN only)

### Files (Protected)
- `POST /api/v1/files/upload` - Upload file
- `GET /api/v1/files` - Get all files
- `GET /api/v1/files/:id` - Get file by ID
- `GET /api/v1/files/:id/download` - Download file
- `DELETE /api/v1/files/:id` - Delete file

## Environment Variables

See `.env.example` for all available configuration options.

## Database Schema

The application uses three main models:
- **User**: User accounts with roles
- **RefreshToken**: JWT refresh tokens
- **File**: File metadata and storage information

## Security

- Passwords are hashed using bcrypt
- JWT tokens for stateless authentication
- Role-based access control middleware
- Helmet for security headers
- CORS configuration
- File type and size validation

## License

MIT
