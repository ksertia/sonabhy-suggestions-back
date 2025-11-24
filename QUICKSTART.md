# Quick Start Guide

Get your Idea Box Backend up and running in 5 minutes!

## Prerequisites

- Node.js v18+ installed
- PostgreSQL v14+ installed and running
- Terminal/Command Prompt

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

Copy the example environment file:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Windows (CMD)
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

### 3. Configure Database

Edit `.env` and update the `DATABASE_URL`:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/idea_box_db?schema=public"
```

**Example:**
```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/idea_box_db?schema=public"
```

### 4. Create Database

Open PostgreSQL and create the database:

```sql
CREATE DATABASE idea_box_db;
```

Or use command line:

```bash
# Windows
psql -U postgres -c "CREATE DATABASE idea_box_db;"

# Linux/Mac
psql -U postgres -c "CREATE DATABASE idea_box_db;"
```

### 5. Run Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

When prompted for migration name, type: `init`

### 6. Seed Database (Optional but Recommended)

```bash
npm run prisma:seed
```

This creates test users:
- **Admin:** admin@ideabox.com / Admin@123
- **Manager:** manager@ideabox.com / Manager@123  
- **User:** user@ideabox.com / User@123

### 7. Start Server

```bash
npm run dev
```

✅ **Server running at:** http://localhost:3000
✅ **API Documentation:** http://localhost:3000/api-docs

## Test the API

### Option 1: Use Swagger UI (Easiest)

1. Open http://localhost:3000/api-docs
2. Click on `POST /auth/login`
3. Click "Try it out"
4. Use credentials: `admin@ideabox.com` / `Admin@123`
5. Execute and copy the `accessToken`
6. Click "Authorize" button at top
7. Paste token and click "Authorize"
8. Now you can test all endpoints!

### Option 2: Use cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@ideabox.com\",\"password\":\"Admin@123\"}"
```

**Get Profile (replace TOKEN with your access token):**
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile ^
  -H "Authorization: Bearer TOKEN"
```

### Option 3: Use Postman

1. Import the API from: http://localhost:3000/api-docs
2. Set up Bearer Token authentication
3. Start testing!

## Common Issues

### "Database connection failed"
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database `idea_box_db` exists

### "Port 3000 already in use"
- Change PORT in `.env` to another port (e.g., 3001)
- Or kill the process using port 3000

### "Prisma Client not generated"
```bash
npm run prisma:generate
```

## Next Steps

- Read the full [SETUP.md](SETUP.md) for detailed information
- Check [README.md](README.md) for API documentation
- Explore the codebase structure
- Customize for your needs!

## Project Features

✅ JWT Authentication (Access + Refresh Tokens)
✅ Role-Based Access Control (USER/MANAGER/ADMIN)
✅ File Upload with Disk Storage
✅ Request Validation (Zod)
✅ Global Error Handling
✅ Swagger/OpenAPI Documentation
✅ Clean Architecture (Controllers/Services/Repositories)
✅ PostgreSQL with Prisma ORM

Happy coding! 🚀
