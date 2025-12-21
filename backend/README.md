# Custom Authentication Backend Service

A custom authentication service backend built with Fastify, TypeScript, PostgreSQL, and Drizzle ORM, similar to Developer Okta.

## Features

- User registration and login
- JWT token generation with configurable claims
- Configurable token expiry
- Password hashing with bcrypt
- PostgreSQL database with Drizzle ORM
- TypeScript for type safety
- CORS enabled for frontend integration

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (local or remote)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```
JWT_SECRET=
PORT=4501
DATABASE_URL=
```

3. Create the PostgreSQL database:
```bash
createdb ownokta
# Or using psql:
# psql -U postgres
# CREATE DATABASE ownokta;
```

4. Generate database migrations:
```bash
npm run db:generate
```

5. Run database migrations:
```bash
npm run db:migrate
```

6. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Database Management

- Generate migrations: `npm run db:generate`
- Run migrations: `npm run db:migrate`
- Open Drizzle Studio (database GUI): `npm run db:studio`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ username, email, password }`
  - Returns: `{ token, user }`

- `POST /api/auth/login` - Login with email and password
  - Body: `{ email, password }`
  - Returns: `{ token, user }`

- `GET /api/auth/me` - Get current user info (requires Bearer token)
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ user, claims }`

- `POST /api/auth/decode` - Decode a JWT token (for debugging)
  - Body: `{ token }`
  - Returns: `{ decoded }`

### Configuration

- `GET /api/config/claims` - Get current claim configuration
- `POST /api/config/claims` - Update claim configuration
  - Body: `{ includeUsername?, includeEmail?, includeUserId?, tokenExpiry? }`

### Health

- `GET /health` - Health check endpoint

## Claim Configuration

You can configure which claims are included in the JWT token:

- `includeUsername` - Include username in token (default: true)
- `includeEmail` - Include email in token (default: true)
- `includeUserId` - Include user ID as 'sub' claim (default: true)
- `tokenExpiry` - Token expiration time (default: '24h')

## Notes

- This is a demo implementation using in-memory storage. For production, replace with a proper database.
- Change the JWT_SECRET in production to a secure random string.

