# Docker Deployment Guide

Complete guide for deploying Idea Box Backend with Docker.

## 🐳 Overview

This Docker setup includes:
- **Node.js Backend** (Express + Prisma)
- **PostgreSQL 15** (Database)
- **PGAdmin** (Database management UI)
- **Automatic Prisma migrations** on startup
- **Health checks** for all services
- **Persistent volumes** for data
- **Production-ready** configuration

---

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB+ available RAM
- 5GB+ available disk space

**Install Docker**:
- Windows/Mac: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Linux: [Docker Engine](https://docs.docker.com/engine/install/)

---

## 🚀 Quick Start

### 1. Setup Environment Variables

```bash
# Copy the Docker environment template
cp .env.docker .env

# Edit .env and change the following:
# - POSTGRES_PASSWORD (required)
# - JWT_SECRET (required)
# - JWT_REFRESH_SECRET (required)
# - PGADMIN_PASSWORD (optional)
```

**⚠️ Important**: Change default passwords and secrets in production!

### 2. Build and Start Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
```

### 3. Verify Services

```bash
# Check service status
docker-compose ps

# Should show:
# - ideabox-postgres (healthy)
# - ideabox-backend (healthy)
# - ideabox-pgadmin (running)
```

### 4. Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Backend API** | http://localhost:3000 | N/A |
| **Swagger Docs** | http://localhost:3000/api-docs | N/A |
| **PGAdmin** | http://localhost:5050 | See .env |
| **PostgreSQL** | localhost:5432 | See .env |

---

## 📦 Services Configuration

### Backend Service

**Container**: `ideabox-backend`
**Port**: 3000 (configurable via `BACKEND_PORT`)
**Features**:
- Auto-runs `prisma migrate deploy` on startup
- Health check endpoint at `/health`
- Persistent uploads volume
- Non-root user for security

**Environment Variables**:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
CORS_ORIGIN=*
```

### PostgreSQL Service

**Container**: `ideabox-postgres`
**Port**: 5432 (configurable via `POSTGRES_PORT`)
**Version**: PostgreSQL 15 Alpine
**Features**:
- Persistent data volume
- Health checks
- Automatic initialization

**Default Credentials**:
```
User: ideabox
Password: ideabox_password_change_me
Database: ideabox_db
```

### PGAdmin Service

**Container**: `ideabox-pgadmin`
**Port**: 5050 (configurable via `PGADMIN_PORT`)
**Features**:
- Web-based database management
- Persistent configuration
- Pre-configured for PostgreSQL connection

**Default Credentials**:
```
Email: admin@ideabox.com
Password: admin_change_me
```

---

## 🔧 Docker Commands

### Start Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend

# Start with rebuild
docker-compose up -d --build
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# Stop specific service
docker-compose stop backend
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Execute Commands

```bash
# Access backend container shell
docker-compose exec backend sh

# Run Prisma commands
docker-compose exec backend npx prisma studio
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed

# Access PostgreSQL
docker-compose exec postgres psql -U ideabox -d ideabox_db
```

---

## 🗄️ Database Management

### Using PGAdmin

1. **Access PGAdmin**: http://localhost:5050
2. **Login** with credentials from `.env`
3. **Add Server**:
   - Name: `Idea Box DB`
   - Host: `postgres`
   - Port: `5432`
   - Username: From `.env` (`POSTGRES_USER`)
   - Password: From `.env` (`POSTGRES_PASSWORD`)
   - Database: From `.env` (`POSTGRES_DB`)

### Using Prisma Studio

```bash
# Start Prisma Studio
docker-compose exec backend npx prisma studio

# Access at http://localhost:5555
```

### Direct PostgreSQL Access

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U ideabox -d ideabox_db

# Run SQL commands
\dt                    # List tables
\d users              # Describe users table
SELECT * FROM users;  # Query users
\q                    # Quit
```

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U ideabox ideabox_db > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U ideabox ideabox_db < backup.sql
```

---

## 🔄 Prisma Migrations

### Automatic Migrations

Migrations run automatically on backend startup via:
```bash
npx prisma migrate deploy
```

### Manual Migrations

```bash
# Run migrations manually
docker-compose exec backend npx prisma migrate deploy

# Create new migration (development)
docker-compose exec backend npx prisma migrate dev --name migration_name

# Reset database (⚠️ deletes all data)
docker-compose exec backend npx prisma migrate reset
```

### Seed Database

```bash
# Run seed script
docker-compose exec backend npm run prisma:seed
```

---

## 📊 Monitoring & Health Checks

### Health Check Endpoints

**Backend Health**:
```bash
curl http://localhost:3000/health
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-11-23T15:00:00.000Z"
}
```

### Container Health Status

```bash
# Check health status
docker-compose ps

# View health check logs
docker inspect ideabox-backend | grep -A 10 Health
```

### View Metrics

```bash
# Container stats
docker stats

# Specific container
docker stats ideabox-backend
```

---

## 🔐 Security Best Practices

### 1. Change Default Credentials

**Required Changes in `.env`**:
```env
POSTGRES_PASSWORD=strong-random-password-here
JWT_SECRET=minimum-32-characters-random-string
JWT_REFRESH_SECRET=different-32-characters-random-string
PGADMIN_PASSWORD=strong-admin-password
```

### 2. Use Secrets Management

For production, use Docker secrets or environment variable injection:

```yaml
# docker-compose.prod.yml
services:
  backend:
    environment:
      JWT_SECRET: ${JWT_SECRET}  # From CI/CD or secrets manager
```

### 3. Network Security

```yaml
# Restrict PostgreSQL access
services:
  postgres:
    ports:
      - "127.0.0.1:5432:5432"  # Only localhost
```

### 4. Non-Root User

The Dockerfile already uses a non-root user (`nodejs:1001`).

### 5. Update Images Regularly

```bash
# Pull latest images
docker-compose pull

# Rebuild with latest base images
docker-compose build --no-cache
```

---

## 🚀 Production Deployment

### 1. Production Environment File

Create `.env.production`:
```env
NODE_ENV=production
POSTGRES_PASSWORD=<strong-password>
JWT_SECRET=<32-char-secret>
JWT_REFRESH_SECRET=<32-char-secret>
CORS_ORIGIN=https://yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=<app-password>
```

### 2. Production Docker Compose

Create `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    env_file:
      - .env.production
    ports:
      - "3000:3000"
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 3. Deploy

```bash
# Build and start production
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. SSL/TLS with Nginx

Add Nginx reverse proxy:
```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Check logs**:
```bash
docker-compose logs backend
```

**Common issues**:
1. Database not ready → Wait for health check
2. Migration failed → Check database connection
3. Port already in use → Change `BACKEND_PORT` in `.env`

### Database Connection Failed

**Check PostgreSQL status**:
```bash
docker-compose ps postgres
docker-compose logs postgres
```

**Test connection**:
```bash
docker-compose exec postgres pg_isready -U ideabox
```

### Migrations Failed

**Reset and retry**:
```bash
# Stop services
docker-compose down

# Remove volumes (⚠️ deletes data)
docker-compose down -v

# Start fresh
docker-compose up -d
```

### PGAdmin Can't Connect

**Check network**:
```bash
docker network inspect ideabox-network
```

**Server settings in PGAdmin**:
- Host: `postgres` (not `localhost`)
- Port: `5432`
- Username/Password: From `.env`

### Out of Disk Space

**Clean up Docker**:
```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a --volumes
```

---

## 📈 Performance Tuning

### PostgreSQL Configuration

Add to `docker-compose.yml`:
```yaml
services:
  postgres:
    command:
      - "postgres"
      - "-c"
      - "max_connections=200"
      - "-c"
      - "shared_buffers=256MB"
      - "-c"
      - "effective_cache_size=1GB"
```

### Backend Scaling

```bash
# Scale backend instances
docker-compose up -d --scale backend=3

# Use load balancer (Nginx, Traefik)
```

### Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

---

## 🔄 Updates & Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# Run new migrations
docker-compose exec backend npx prisma migrate deploy
```

### Update Docker Images

```bash
# Pull latest base images
docker-compose pull

# Rebuild
docker-compose build --no-cache

# Restart
docker-compose up -d
```

### Backup Before Updates

```bash
# Backup database
docker-compose exec postgres pg_dump -U ideabox ideabox_db > backup-$(date +%Y%m%d).sql

# Backup volumes
docker run --rm -v ideabox_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-data-$(date +%Y%m%d).tar.gz /data
```

---

## 📋 Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | production | Node environment |
| `PORT` | 3000 | Backend port |
| `POSTGRES_USER` | ideabox | PostgreSQL username |
| `POSTGRES_PASSWORD` | - | PostgreSQL password (required) |
| `POSTGRES_DB` | ideabox_db | Database name |
| `POSTGRES_PORT` | 5432 | PostgreSQL port |
| `PGADMIN_EMAIL` | admin@ideabox.com | PGAdmin email |
| `PGADMIN_PASSWORD` | - | PGAdmin password (required) |
| `PGADMIN_PORT` | 5050 | PGAdmin port |
| `BACKEND_PORT` | 3000 | Exposed backend port |
| `JWT_SECRET` | - | JWT secret (required) |
| `JWT_REFRESH_SECRET` | - | Refresh token secret (required) |
| `UPLOAD_DIR` | uploads | Upload directory |
| `MAX_FILE_SIZE` | 5242880 | Max file size (5MB) |
| `CORS_ORIGIN` | * | CORS origin |

---

## 🎯 Quick Commands Reference

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f backend

# Restart
docker-compose restart backend

# Shell access
docker-compose exec backend sh

# Database access
docker-compose exec postgres psql -U ideabox -d ideabox_db

# Prisma commands
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma studio
docker-compose exec backend npm run prisma:seed

# Backup
docker-compose exec postgres pg_dump -U ideabox ideabox_db > backup.sql

# Clean up
docker-compose down -v
docker system prune -a
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [Prisma with Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)

---

## ✅ Summary

✅ **Complete Docker Setup** with 3 services
✅ **PostgreSQL 15** with persistent storage
✅ **PGAdmin** for database management
✅ **Automatic Migrations** on startup
✅ **Health Checks** for all services
✅ **Production Ready** with security best practices
✅ **Easy Deployment** with single command
✅ **Comprehensive Documentation** with troubleshooting

**Start your application**:
```bash
cp .env.docker .env
# Edit .env with your credentials
docker-compose up -d
```

**Access**:
- Backend: http://localhost:3000
- API Docs: http://localhost:3000/api-docs
- PGAdmin: http://localhost:5050

🚀 Happy Dockerizing!
