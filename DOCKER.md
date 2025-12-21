# Docker Deployment Guide

This guide explains how to deploy the Own authentication service using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

1. **Clone the repository** (if you haven't already):
```bash
git clone <repository-url>
cd Backend-OwnOkta
```

2. **Create a `.env` file** in the root directory:
```bash
# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Database URL (for Docker, use service name 'postgres' as host)
DATABASE_URL=

# PostgreSQL Configuration (optional - defaults shown)
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
```

**Note**: The `DATABASE_URL` in Docker should use `postgres` as the hostname (the service name), not `localhost`. For local development outside Docker, use `localhost:5437`.

3. **Build and start all services**:
```bash
docker-compose up -d
```

This will:
- Start PostgreSQL database on port **5437**
- Build and start the backend service on port **4501**
- Build and start the frontend service on port **4500**
- Automatically run database migrations

4. **Access the application**:
- Frontend: http://localhost:4500
- Backend API: http://localhost:4501
- PostgreSQL: localhost:5437

## Services

### PostgreSQL Database
- **Container**: `ownokta-postgres`
- **Port**: `5437` (host) → `5432` (container)
- **Database**: `testDB`
- **User**: `postgres`
- **Password**: `postgres`
- **Volume**: `postgres_data` (persists data)

### Backend Service
- **Container**: `ownokta-backend`
- **Port**: `4501`
- **Environment**: Production
- **Auto-migrations**: Runs on startup

### Frontend Service
- **Container**: `ownokta-frontend`
- **Port**: `4500` (host) → `8080` (container)
- **Web Server**: Nginx
- **API Proxy**: Automatically proxies `/api` requests to backend

## Docker Compose Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes (⚠️ deletes database data)
```bash
docker-compose down -v
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Rebuild services
```bash
# Rebuild all
docker-compose build

# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild and restart
docker-compose up -d --build
```

### Execute commands in containers
```bash
# Backend shell
docker-compose exec backend sh

# Run migrations manually
docker-compose exec backend npm run db:migrate

# Database shell
docker-compose exec postgres psql -U postgres -d ownokta
```

## Environment Variables

You can customize the deployment by creating a `.env` file in the root directory:

```env
# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Database URL (for Docker, use service name 'postgres' as host)
DATABASE_URL=

# PostgreSQL Configuration (optional)
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
```

The `docker-compose.yml` file reads these variables from `.env` and provides defaults if not set.

**Important Notes**:
- For Docker Compose, use `postgres` as the hostname in `DATABASE_URL` (the service name)
- For local development outside Docker, use `localhost:5437` in `DATABASE_URL`
- All variables are optional and will use defaults if not provided

## Database Migrations

Migrations are automatically run when the backend container starts. If you need to run them manually:

```bash
docker-compose exec backend npm run db:migrate
```

To generate new migrations (requires source code access):
```bash
cd backend
npm run db:generate
```

## Production Deployment

For production deployment, consider:

1. **Change default passwords**:
   - Update PostgreSQL password in `docker-compose.yml`
   - Update `JWT_SECRET` in `.env` file

2. **Use environment-specific configuration**:
   - Create separate `docker-compose.prod.yml` for production
   - Use Docker secrets for sensitive data

3. **Enable HTTPS**:
   - Add reverse proxy (nginx/traefik) in front of services
   - Use Let's Encrypt for SSL certificates

4. **Database backups**:
   - Set up regular backups of the `postgres_data` volume
   - Consider using managed database services

5. **Monitoring**:
   - Add health checks (already included)
   - Set up logging aggregation
   - Monitor resource usage

## Troubleshooting

### Database connection issues
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres pg_isready -U postgres
```

### Backend not starting
```bash
# Check backend logs
docker-compose logs backend

# Check if migrations ran successfully
docker-compose exec backend npm run db:migrate
```

### Port conflicts
If ports 4500, 4501, or 5437 are already in use, update them in `docker-compose.yml`:
```yaml
ports:
  - "4500:8080"  # Change 4500 to another port
```

### Reset everything
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove images (optional)
docker-compose down --rmi all

# Start fresh
docker-compose up -d --build
```

## Development with Docker

For development, you can mount source code as volumes:

```yaml
# Add to docker-compose.yml for development
volumes:
  - ./backend/src:/app/src
  - ./frontend/src:/app/src
```

Then use `docker-compose up` to see live changes (requires rebuild for TypeScript changes).

## Network

All services are connected via the `ownokta-network` bridge network. Services can communicate using their service names:
- Backend → Database: `postgres:5432`
- Frontend → Backend: `backend:4501`

