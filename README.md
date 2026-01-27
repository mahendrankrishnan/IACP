# Custom Authentication & Authorization Service

A custom authentication Service Provider for providing authentication & authorization service. This application is called IdentityAuthClaimProvider(IACP) - Identity → Who the user is, Auth → Authentication / Authorization,Claim → What attributes/permissions are issued,Provider → Source of truth, built with TypeScript, Node.js Fastify backend, PostgreSQL, Drizzle ORM, and React frontend. This service allows you to configure claim details (username, email) and generate JWT tokens for authentication.


## Features

- ✅ - 🔐 Allow User registration and login
- ✅ - 🎫 JWT token generation with configurable claims
- ✅ - ⚙️ Configurable token expiry settings
- ✅ - 🎨 Modern React UI with protected routes
- ✅ - 🔒 Password hashing with bcrypt
- ✅ - 📊 Token decoding and claim visualization
- ✅ - 🛠️ Runtime claim configuration
- ✅ - 💾 PostgreSQL database with Drizzle ORM
- ✅ - 📘 TypeScript for type safety
- ✅ - 🐳 Docker & Docker Compose support
- ✅ - ✅ **Request/Response schema validation** with Fastify
- ✅ - 📚 **Interactive API documentation** with Swagger/OpenAPI
- ✅ - 🏗️ **Modular route architecture** for better code organization

## System Architecture

### Overview

IACP (Identity, Auth, Claim, Provider) is a custom authentication and authorization service that provides identity management, authentication, and configurable JWT token claims. The system follows a three-tier architecture with clear separation of concerns.

### Architecture Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React Frontend (Port 4500)                               │  │
│  │  - User Interface                                         │  │
│  │  - Protected Routes                                      │  │
│  │  - Token Management                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Fastify Backend API (Port 4501)                         │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │ Auth Routes  │  │ User Routes  │  │ Config Routes│  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │ Auth Service │  │ User Service │  │ JWT Service  │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  │  ┌──────────────┐  ┌──────────────┐                    │  │
│  │  │   Schemas    │  │   Validators │                    │  │
│  │  └──────────────┘  └──────────────┘                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Drizzle ORM
                              │
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database (Port 5437)                         │  │
│  │  - Users Table                                           │  │
│  │  - Config Table                                          │  │
│  │  - Persistent Storage                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### IACP Concept

**IACP** stands for:
- **Identity** → Who the user is (user identification, profile)
- **Auth** → Authentication / Authorization (login, token validation)
- **Claim** → What attributes/permissions are issued (JWT claims: username, email, phone, userId)
- **Provider** → Source of truth (database, token issuer)

The system acts as a centralized identity provider that:
1. **Manages Identity**: Stores user information (username, email, password)
2. **Handles Authentication**: Validates credentials and issues tokens
3. **Configures Claims**: Dynamically configures which user attributes are included in JWT tokens
4. **Provides Tokens**: Issues JWT tokens that can be used across multiple applications

### Authentication Flow

```
1. User Registration/Login
   ┌─────────┐
   │ Frontend│
   └────┬────┘
        │ POST /api/auth/register or /api/auth/login
        │ { email, password, username }
        ▼
   ┌─────────┐
   │ Backend │
   │  API    │
   └────┬────┘
        │
        ├─► Schema Validation (Fastify)
        │
        ├─► Password Hashing (bcrypt)
        │
        ├─► Database Query (Drizzle ORM)
        │
        └─► JWT Token Generation
            │
            ├─► Read Claim Configuration
            │
            ├─► Build Claims Object
            │   { sub, username?, email?, userId? }
            │
            └─► Sign Token with JWT_SECRET
                │
                ▼
   ┌─────────┐
   │ Frontend│ ◄─── { token, user }
   └─────────┘
        │
        │ Store token in localStorage
        │
        ▼
   Protected Routes Access
```

### Token Validation Flow

```
1. Protected Route Access
   ┌─────────┐
   │ Frontend│
   └────┬────┘
        │ GET /api/auth/me
        │ Authorization: Bearer <token>
        ▼
   ┌─────────┐
   │ Backend │
   │  API    │
   └────┬────┘
        │
        ├─► Extract Token from Header
        │
        ├─► Verify Token Signature
        │
        ├─► Check Token Expiry
        │
        ├─► Decode Claims
        │
        └─► Query Database for User
            │
            ▼
   ┌─────────┐
   │ Frontend│ ◄─── { user, claims }
   └─────────┘
```

### Docker Architecture

The system is containerized using Docker Compose with three main services:

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network: iacp-network              │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐ │
│  │   Frontend   │      │    Backend   │      │ Postgres │ │
│  │  Container   │◄────►│  Container   │◄────►│Container │ │
│  │              │      │              │      │          │ │
│  │ Port: 4500   │      │ Port: 4501   │      │ Port:    │ │
│  │              │      │              │      │ 5432     │ │
│  │ React + Vite │      │ Fastify API  │      │ Database │ │
│  └──────────────┘      └──────────────┘      └──────────┘ │
│                                                              │
│  Volume: postgres_data (persistent storage)                 │
└─────────────────────────────────────────────────────────────┘
```

**Service Dependencies:**
- **Frontend** → Depends on Backend (waits for backend to be ready)
- **Backend** → Depends on Postgres (waits for health check)
- **Postgres** → Standalone (no dependencies)

**Startup Sequence:**
1. Postgres starts and becomes healthy
2. Backend starts, runs migrations, then starts server
3. Frontend starts and connects to backend

### Deployment Diagram (Docker Desktop)

The system is deployed using Docker Desktop with the following architecture:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Host Machine (Windows/Mac/Linux)                   │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      Docker Desktop                                  │  │
│  │                                                                       │  │
│  │  ┌──────────────────────────────────────────────────────────────┐   │  │
│  │  │              Docker Engine                                    │   │  │
│  │  │                                                               │   │  │
│  │  │  ┌────────────────────────────────────────────────────────┐  │   │  │
│  │  │  │         Docker Network: iacp-network                   │  │   │  │
│  │  │  │                                                         │  │   │  │
│  │  │  │  ┌──────────────┐   ┌──────────────┐   ┌──────────┐  │  │   │  │
│  │  │  │  │  Frontend    │   │   Backend    │   │ Postgres │  │  │   │  │
│  │  │  │  │  Container   │   │  Container   │   │ Container│  │  │   │  │
│  │  │  │  │              │   │              │   │          │  │  │   │  │
│  │  │  │  │ React + Vite │   │ Fastify API  │   │PostgreSQL│  │  │   │  │
│  │  │  │  │              │   │ Node.js      │   │  16      │  │  │   │  │
│  │  │  │  │ Port: 8080   │   │ Port: 4501   │   │Port:5432 │  │  │   │  │
│  │  │  │  └──────┬───────┘   └──────┬───────┘   └────┬─────┘  │  │   │  │
│  │  │  │         │                  │                │        │  │   │  │
│  │  │  │         └──────────────────┴────────────────┘        │  │   │  │
│  │  │  │                        (Internal Communication)      │  │   │  │
│  │  │  └────────────────────────────────────────────────────────┘  │   │  │
│  │  │                                                               │   │  │
│  │  │  ┌────────────────────────────────────────────────────────┐  │   │  │
│  │  │  │              Docker Volumes                            │  │   │  │
│  │  │  │  ┌──────────────────────────────────────────────────┐  │   │  │
│  │  │  │  │  postgres_data                                   │  │   │  │
│  │  │  │  │  (Persistent database storage)                   │  │   │  │
│  │  │  │  └──────────────────────────────────────────────────┘  │   │  │
│  │  │  └────────────────────────────────────────────────────────┘  │   │  │
│  │  └───────────────────────────────────────────────────────────────┘   │  │
│  │                                                                       │  │
│  │  Port Mappings:                                                      │  │
│  │  - Frontend:  4500:8080  (Host:Container)                           │  │
│  │  - Backend:   4501:4501  (Host:Container)                           │  │
│  │  - Postgres:  5437:5432  (Host:Container)                           │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  External Access:                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  Browser                                                            │     │
│  │  http://localhost:4500 (Frontend)                                  │     │
│  │  http://localhost:4501 (Backend API)                               │     │
│  │  http://localhost:4501/docs (Swagger UI)                         │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                               │
│  Configuration Files:                                                         │
│  - docker-compose.yml (Service orchestration)                                │
│  - .env (Environment variables: JWT_SECRET, DB credentials)                  │
└───────────────────────────────────────────────────────────────────────────────┘
```

**Deployment Components:**

1. **Docker Desktop**
   - Provides Docker Engine and Docker Compose
   - Manages container lifecycle and networking
   - Handles port mappings from containers to host

2. **Container Services**
   - **Frontend Container**: Serves React application (Vite build)
   - **Backend Container**: Runs Fastify API server
   - **Postgres Container**: PostgreSQL 16 database

3. **Networking**
   - All containers communicate via `iacp-network` bridge network
   - Containers use service names (e.g., `postgres`, `backend`) for internal DNS
   - Port mappings expose services to host machine

4. **Storage**
   - `postgres_data` volume for persistent database storage
   - Data persists across container restarts
   - Volume stored in Docker Desktop's data directory

5. **Configuration**
   - `docker-compose.yml`: Defines services, networks, volumes, and dependencies
   - `.env` file: Contains sensitive configuration (JWT_SECRET, database credentials)

**Deployment Flow:**

1. **Start Docker Desktop** on the host machine
2. **Run `docker-compose up -d`** from project root
3. Docker Compose reads `docker-compose.yml` and `.env`
4. Creates network `iacp-network`
5. Creates volume `postgres_data`
6. Starts containers in dependency order:
   - Postgres → Backend → Frontend
7. Services are accessible on host ports (4500, 4501, 5437)
8. Users access application via `http://localhost:4500`

### Data Flow

**Registration Flow:**
1. User submits registration form → Frontend
2. Frontend sends POST request → Backend API
3. Backend validates schema → Fastify validation
4. Backend hashes password → bcrypt
5. Backend saves user → PostgreSQL via Drizzle ORM
6. Backend generates JWT → With configured claims
7. Backend returns token → Frontend
8. Frontend stores token → localStorage
9. Frontend redirects → Dashboard

**Login Flow:**
1. User submits credentials → Frontend
2. Frontend sends POST request → Backend API
3. Backend validates schema → Fastify validation
4. Backend queries user → PostgreSQL via Drizzle ORM
5. Backend verifies password → bcrypt compare
6. Backend generates JWT → With configured claims
7. Backend returns token → Frontend
8. Frontend stores token → localStorage
9. Frontend redirects → Dashboard

**Protected Route Access:**
1. User navigates to protected route → Frontend
2. Frontend checks localStorage → For token
3. Frontend sends GET request → Backend API with Bearer token
4. Backend validates token → JWT verification
5. Backend queries user → PostgreSQL via Drizzle ORM
6. Backend returns user data → Frontend
7. Frontend renders protected content

### Technology Stack

**Frontend:**
- React 18+ (UI framework)
- React Router (routing)
- Vite (build tool)
- TypeScript (type safety)

**Backend:**
- Node.js 18+ (runtime)
- Fastify (web framework)
- TypeScript (type safety)
- Drizzle ORM (database ORM)
- bcrypt (password hashing)
- jsonwebtoken (JWT generation)
- Swagger/OpenAPI (API documentation)

**Database:**
- PostgreSQL 16 (relational database)
- Drizzle Kit (migration tool)

**DevOps:**
- Docker (containerization)
- Docker Compose (orchestration)

### Security Architecture

- **Password Security**: Passwords are hashed using bcrypt before storage
- **Token Security**: JWT tokens are signed with a secret key (JWT_SECRET)
- **Input Validation**: All API endpoints use JSON schema validation
- **CORS**: Configured for frontend-backend communication
- **Environment Variables**: Sensitive data stored in `.env` files
- **Token Expiry**: Configurable token expiration times
- **Protected Routes**: Frontend routes protected with authentication checks

## Database Schema (ER Diagram)

The database follows a relational model with the following entities and relationships:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Database Schema (ER Diagram)                 │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│       users          │
├──────────────────────┤
│ PK  id               │
│     username (UNIQUE)│
│     email (UNIQUE)   │
│     password         │
│     created_at       │
│     updated_at       │
└──────────┬───────────┘
           │
           │ 1
           │
           │ N
           │
┌──────────▼───────────────────┐
│   user_applications          │
├──────────────────────────────┤
│ PK  id                       │
│ FK  user_id ────────────────┼──┐
│ FK  app_id  ────────────────┼──┼──┐
│     created_at               │  │  │
│     updated_at               │  │  │
│                              │  │  │
│ UNIQUE(user_id, app_id)      │  │  │
└──────────────────────────────┘  │  │
                                   │  │
                                   │  │
┌──────────────────────────────────┘  │
│    applications                    │
├────────────────────────────────────┤
│ PK  id                              │
│     app_name (UNIQUE)               │
│     created_at                      │
│     updated_at                      │
└──────────┬──────────────────────────┘
           │
           │ 1
           │
           │ N
           │
┌──────────▼───────────────────┐
│      app_roles               │
├──────────────────────────────┤
│ PK  id                       │
│ FK  app_id ──────────────────┼──┐
│ FK  role_id ─────────────────┼──┼──┐
│     created_at               │  │  │
│     updated_at               │  │  │
│                              │  │  │
│ UNIQUE(app_id, role_id)      │  │  │
└──────────────────────────────┘  │  │
                                   │  │
                                   │  │
┌──────────────────────────────────┘  │
│        roles                        │
├─────────────────────────────────────┤
│ PK  id                               │
│     role_name (UNIQUE)               │
│     created_at                       │
│     updated_at                       │
└──────────────────────────────────────┘

┌──────────────────────┐
│   claim_config       │
├──────────────────────┤
│ PK  id               │
│     include_username │
│     include_email  
│     include_user_id  │
│     token_expiry     │
│     updated_at       │
└──────────────────────┘

Legend:
  PK = Primary Key
  FK = Foreign Key
  N  = Many (One-to-Many relationship)
  1  = One (One-to-Many relationship)
```

### Entity Relationships

1. **users** ↔ **user_applications** ↔ **applications**
   - Many-to-Many: Users can be assigned to multiple applications
   - Applications can have multiple users
   - Junction table: `user_applications` with unique constraint on (user_id, app_id)

2. **applications** ↔ **app_roles** ↔ **roles**
   - Many-to-Many: Applications can have multiple roles
   - Roles can be assigned to multiple applications
   - Junction table: `app_roles` with unique constraint on (app_id, role_id)

3. **claim_config**
   - Standalone table: Stores global JWT token claim configuration
   - Single row configuration for the entire system

### Table Descriptions

- **users**: Stores user account information (username, email, hashed password)
- **applications**: Represents applications that can use the IACP service
- **roles**: Defines roles that can be assigned to applications
- **app_roles**: Junction table linking applications to roles
- **user_applications**: Junction table linking users to applications (who has access to which app)
- **claim_config**: Global configuration for JWT token claims

### Key Constraints

- **Unique Constraints**:
  - `users.username` must be unique
  - `users.email` must be unique
  - `applications.app_name` must be unique
  - `roles.role_name` must be unique
  - `user_applications(user_id, app_id)` combination must be unique
  - `app_roles(app_id, role_id)` combination must be unique

- **Foreign Key Constraints**:
  - `user_applications.user_id` → `users.id` (CASCADE DELETE)
  - `user_applications.app_id` → `applications.id` (CASCADE DELETE)
  - `app_roles.app_id` → `applications.id` (CASCADE DELETE)
  - `app_roles.role_id` → `roles.id` (CASCADE DELETE)

## Project Structure

```
IACP/
├── backend/          # Fastify TypeScript backend
│   ├── src/          # TypeScript source files
│   │   ├── db/       # Database schema and configuration
│   │   ├── routes/   # API route handlers
│   │   │   ├── auth.routes.ts      # Authentication routes
│   │   │   ├── user.routes.ts      # User management routes
│   │   │   ├── config.routes.ts    # Configuration routes
│   │   │   ├── health.routes.ts    # Health check routes
│   │   │   └── index.ts            # Route registration
│   │   ├── schemas/  # JSON schemas for validation
│   │   │   ├── auth.schemas.ts     # Auth endpoint schemas
│   │   │   ├── user.schemas.ts     # User endpoint schemas
│   │   │   ├── config.schemas.ts   # Config endpoint schemas
│   │   │   ├── health.schemas.ts   # Health check schemas
│   │   │   └── index.ts            # Schema exports
│   │   ├── services/ # Business logic services
│   │   ├── utils/    # Utility functions
│   │   ├── types/    # TypeScript type definitions
│   │   └── server.ts # Main server file
│   ├── drizzle/      # Database migrations
│   └── package.json  # Backend dependencies
└── frontend/         # React frontend
    ├── src/          # React source files
    └── package.json  # Frontend dependencies
```

## Quick Start

### Option 1: Docker Deployment (Recommended)

The easiest way to get started is using Docker Compose. This will set up all services (PostgreSQL, Backend, and Frontend) with a single command.

#### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Git (to clone the repository)

#### Setup Steps

1. **Create a `.env` file** in the root directory:
```bash
# JWT Secret (change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Database URL (for Docker, use service name 'postgres' as host)
# The backend will construct this automatically if not provided
DATABASE_URL=postgresql://postgres:testpostgres@postgres:5432/testDB

# PostgreSQL Configuration (optional - defaults shown)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=testpostgres
POSTGRES_DB=testDB
```

2. **Start all services**:
```bash
docker-compose up -d
```

The `-d` flag runs containers in detached mode (background).

3. **Access the application**:
- **Frontend**: http://localhost:4500
- **Backend API**: http://localhost:4501
- **API Documentation (Swagger)**: http://localhost:4501/docs
- **PostgreSQL**: localhost:5437

#### Docker Compose Services

The `docker-compose.yml` file defines three services:

- **postgres**: PostgreSQL 16 database
  - Port: `5437:5432` (host:container)
  - Health checks enabled
  - Persistent volume for data storage
  - Automatically creates database on first run

- **backend**: Node.js Fastify backend
  - Port: `4501:4501`
  - Waits for PostgreSQL to be healthy before starting
  - Automatically runs database migrations on startup
  - Builds from `./backend/Dockerfile`

- **frontend**: React frontend
  - Port: `4500:8080`
  - Builds from `./frontend/Dockerfile`
  - Depends on backend service

#### Managing Docker Compose Services

**View running containers:**
```bash
docker-compose ps
```

**View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

**Stop services:**
```bash
docker-compose stop
```

**Start services:**
```bash
docker-compose start
```

**Stop and remove containers (keeps volumes):**
```bash
docker-compose down
```

**Stop and remove containers and volumes (⚠️ deletes database data):**
```bash
docker-compose down -v
```

**Rebuild containers (after code changes):**
```bash
docker-compose up -d --build
```

**Restart a specific service:**
```bash
docker-compose restart backend
```

#### Environment Variables

The Docker Compose setup uses environment variables from the `.env` file. The backend service will:
- Use `DATABASE_URL` if provided, or
- Construct it from `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` components

#### Database Migrations

Database migrations run automatically when the backend container starts. The backend service:
1. Waits for PostgreSQL to be healthy
2. Generates migrations if needed
3. Runs all pending migrations
4. Starts the server

#### Troubleshooting

**Container won't start:**
```bash
# Check logs
docker-compose logs backend

# Check if port is already in use
netstat -ano | findstr :4501  # Windows
lsof -i :4501                 # macOS/Linux
```

**Database connection issues:**
- Ensure PostgreSQL container is healthy: `docker-compose ps`
- Check database credentials in `.env` file
- Verify `DATABASE_URL` uses `postgres` as hostname (not `localhost`)

**Rebuild after code changes:**
```bash
docker-compose up -d --build
```

**Reset everything (⚠️ deletes all data):**
```bash
docker-compose down -v
docker-compose up -d --build
```

**Access PostgreSQL directly:**
```bash
docker-compose exec postgres psql -U postgres -d iacp
```

#### Production Considerations

For production deployments:
1. Change `JWT_SECRET` to a strong random value
2. Use secure passwords for PostgreSQL
3. Consider using Docker secrets for sensitive data
4. Set up proper backup strategy for PostgreSQL volume
5. Use reverse proxy (nginx/traefik) for HTTPS
6. Configure resource limits in `docker-compose.yml`
7. Use environment-specific compose files (`docker-compose.prod.yml`)

### Option 2: Local Development

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (running on port 5437)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a PostgreSQL database:
```bash
createdb testDB
# Or using psql:
# psql -U postgres
# CREATE DATABASE iacp;
```

4. Create a `.env` file:
```
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=4501
DATABASE_URL=postgresql://postgres:testpostgres@localhost:5437/testDB
```

5. Generate and run database migrations:
```bash
npm run db:generate
npm run db:migrate
```

6. Build the TypeScript code:
```bash
npm run build
```

7. Start the backend server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The backend will run on `http://localhost:4501`

**API Documentation**: Once the server is running, visit `http://localhost:4501/docs` to access the interactive Swagger UI documentation.

### Database Management

- Generate migrations: `npm run db:generate`
- Run migrations: `npm run db:migrate`
- Open Drizzle Studio (database GUI): `npm run db:studio`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:4500`

## Usage

1. **Register a new user**: Navigate to `/register` and create an account
2. **Login**: Use your credentials to login at `/login`
3. **View Dashboard**: After login, see your user info and JWT token
4. **Configure Claims**: Go to `/config` to configure which claims are included in tokens

## API Endpoints

### Interactive API Documentation

Visit **http://localhost:4501/docs** for interactive Swagger UI documentation with:
- Complete endpoint descriptions
- Request/response schemas
- Try-it-out functionality
- Authentication support

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ username: string, email: string, password: string }`
  - Validates: email format, password min length (6), username pattern
- `POST /api/auth/login` - Login with email and password
  - Body: `{ email: string, password: string }`
  - Returns: JWT token and user info
- `GET /api/auth/me` - Get current user info (requires Bearer token)
  - Headers: `Authorization: Bearer <token>`
  - Returns: User info and JWT claims
- `POST /api/auth/decode` - Decode a JWT token (for debugging)
  - Body: `{ token: string }`

### User Management (Requires Authentication)

- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user (admin)
- `PUT /api/users/:id` - Update a user (admin)

### Configuration

- `GET /api/config/claims` - Get current claim configuration
- `POST /api/config/claims` - Update claim configuration (requires authentication)
  - Body: `{ Username?: boolean, Email?: boolean, UserId?: boolean, tokenExpiry?: string }`

### Health Check

- `GET /health` - Health check endpoint

## Claim Configuration

You can configure which claims are included in JWT tokens:

- **includeUsername**: Include username in token (default: true)
- **includeEmail**: Include email in token (default: true)
- **includeUserId**: Include user ID as 'sub' claim (default: true)
- **tokenExpiry**: Token expiration time (default: '24h')

Options for tokenExpiry: `15m`, `1h`, `24h`, `7d`, `30d`

## Example Token Claims

```json
{
  "sub": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "phone":"4102337562"
  "iat": 1234567890,
  "exp": 1234654290
}
```

## Schema Validation

All API endpoints use Fastify's built-in JSON schema validation:

- **Request Validation**: Automatically validates request bodies, query parameters, and path parameters
- **Response Validation**: Ensures consistent response formats
- **Type Safety**: Full TypeScript support with type inference
- **Error Messages**: Detailed validation error messages for invalid requests

### Validation Rules

- **Email**: Must be a valid email format
- **Password**: Minimum 6 characters, maximum 255 characters
- **Username**: 3-255 characters, alphanumeric and underscore only
- **User ID**: Must be numeric
- **Token Expiry**: Pattern `^[0-9]+[smhd]$` (e.g., `24h`, `30m`, `7d`)

Invalid requests are automatically rejected with `400 Bad Request` and detailed error messages before reaching route handlers.

## Email Notifications

IACP supports sending email notifications when new user accounts are created. The system uses **Nodemailer** with Gmail SMTP support.

### Features

- ✅ Welcome emails sent automatically on user registration
- ✅ Account creation notifications when admin creates users
- ✅ HTML email templates with professional styling
- ✅ Gmail SMTP support (and other SMTP providers)
- ✅ Non-blocking email sending (doesn't affect API response time)

### Gmail Setup

To use Gmail for sending emails, you need to generate an **App Password**:

1. **Enable 2-Step Verification** on your Google Account:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable "2-Step Verification"

2. **Generate App Password**:
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Enter "IACP" as the app name
   - Copy the generated 16-character password

3. **Configure Environment Variables**:

Add these to your `.env` file:

```env
# Email Configuration
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM=your-email@gmail.com  # Optional, defaults to SMTP_USER
```

**Important**: Use the **App Password** (not your regular Gmail password) in `SMTP_PASSWORD`.

### Docker Configuration

The email environment variables are already configured in `docker-compose.yml`. Just add them to your `.env` file and they will be automatically loaded.

### Email Templates

#### Welcome Email (Self-Registration)
- Sent when users register themselves via `/api/auth/register`
- Includes welcome message and platform information

#### Account Creation Email (Admin-Created)
- Sent when admins create users via `/api/users`
- Includes account credentials if password was set
- Includes instructions for first-time login

### Testing Email

1. **Enable email service**: Set `EMAIL_ENABLED=true` in `.env`
2. **Register a new user**: The welcome email will be sent automatically
3. **Check logs**: Email sending status is logged in console

### Troubleshooting

- **Email not sending**: Check `EMAIL_ENABLED` is set to `true`
- **Authentication failed**: Verify App Password is correct (not regular password)
- **Connection timeout**: Ensure firewall allows SMTP port 587
- **Gmail blocks**: If using personal Gmail, ensure "Less secure app access" is not required (use App Password instead)

### Other SMTP Providers

The email service supports any SMTP provider. Just update the configuration:

```env
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587  # or 465 for SSL
SMTP_USER=your-email@yourdomain.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@yourdomain.com
```

## Security Notes

⚠️ **Important for Production:**

1. ✅ Change the `JWT_SECRET` to a secure random string
2. ✅ Use a secure PostgreSQL connection string
3. ✅ Add rate limiting to prevent brute force attacks
4. ✅ Use HTTPS in production
5. ✅ Implement proper error handling and logging
6. ✅ **Input validation and sanitization** - Already implemented with Fastify schemas
7. ✅ Consider adding refresh tokens for better security
8. ✅ Use environment variables for all sensitive configuration

## Development

### Backend Development
- The backend uses TypeScript with Fastify
- Auto-reload is available with `npm run dev` (uses tsx)
- CORS is enabled for frontend integration
- Database migrations are managed with Drizzle Kit
- Type-safe database queries with Drizzle ORM
- **Modular Architecture**: Routes are organized by feature (auth, users, config, health)
- **Schema Validation**: All endpoints use JSON schemas for request/response validation
- **API Documentation**: Swagger/OpenAPI documentation auto-generated from schemas
- **Code Organization**: 
  - Routes in `src/routes/` directory
  - Schemas in `src/schemas/` directory
  - Services in `src/services/` directory
  - Utilities in `src/utils/` directory

### Frontend Development
- Built with React and Vite
- Uses React Router for navigation
- Proxy configured to backend API

## License

ISC

