# Swagger API Documentation

## Accessing Swagger UI

Once the backend server is running, you can access the Swagger API documentation at:

**Local Development:**
```
http://localhost:4501/docs
```

**Docker Container:**
```
http://localhost:4501/docs
```

## Features

The Swagger documentation includes:

- **Complete API Reference**: All endpoints with request/response schemas
- **Interactive Testing**: Try out API endpoints directly from the browser
- **Authentication Support**: Test authenticated endpoints with JWT tokens
- **Schema Validation**: See all request/response models
- **Tagged Endpoints**: Organized by categories (auth, users, roles, etc.)

## Using Swagger UI

### 1. Viewing Endpoints

All endpoints are organized by tags:
- **auth**: Authentication endpoints (register, login, etc.)
- **users**: User management endpoints
- **roles**: Role management endpoints
- **applications**: Application management endpoints
- **config**: Configuration endpoints
- **health**: Health check endpoints

### 2. Testing Endpoints

1. **Open an endpoint** by clicking on it
2. **Click "Try it out"** button
3. **Fill in the required parameters** (if any)
4. **Click "Execute"** to send the request
5. **View the response** below

### 3. Authenticating Requests

For protected endpoints that require JWT authentication:

1. First, **register or login** to get a JWT token:
   - Use `POST /api/auth/register` or `POST /api/auth/login`
   - Copy the `token` from the response

2. **Authorize in Swagger UI**:
   - Click the **"Authorize"** button at the top right
   - Enter your token in the format: `Bearer <your-token>` or just `<your-token>`
   - Click **"Authorize"**
   - Now all protected endpoints will include the token automatically

### 4. Example Workflow

1. **Register a new user**:
   ```
   POST /api/auth/register
   Body: {
     "username": "testuser",
     "email": "test@example.com",
     "phone": "+1234567890",
     "password": "password123"
   }
   ```

2. **Copy the token** from the response

3. **Authorize** in Swagger UI with the token

4. **Test protected endpoints** like:
   - `GET /api/users` - Get all users
   - `GET /api/config/claims` - Get claim configuration
   - `POST /api/config/claims` - Update claim configuration

## API Endpoints Overview

### Authentication (`/api/auth/*`)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email, phone, and password
- `GET /api/auth/me` - Get current user info (requires auth)
- `POST /api/auth/decode` - Decode JWT token

### Users (`/api/users/*`)
- `GET /api/users` - Get all users (requires auth)
- `POST /api/users` - Create a new user (requires auth)
- `GET /api/users/:id` - Get user by ID (requires auth)
- `PUT /api/users/:id` - Update user (requires auth)
- `DELETE /api/users/:id` - Delete user (requires auth)
- `GET /api/users/:id/applications-roles` - Get user's applications and roles (requires auth)

### Roles (`/api/roles/*`)
- `GET /api/roles` - Get all roles (requires auth)
- `POST /api/roles` - Create a role (requires auth)
- `GET /api/roles/:id` - Get role by ID (requires auth)
- `PUT /api/roles/:id` - Update role (requires auth)
- `DELETE /api/roles/:id` - Delete role (requires auth)

### Applications (`/api/applications/*`)
- `GET /api/applications` - Get all applications (requires auth)
- `POST /api/applications` - Create an application (requires auth)
- `GET /api/applications/:id` - Get application by ID (requires auth)
- `PUT /api/applications/:id` - Update application (requires auth)
- `DELETE /api/applications/:id` - Delete application (requires auth)

### User-Application Management (`/api/*`)
- `GET /api/user-applications` - Get all user-application assignments (requires auth)
- `GET /api/applications/:appId/users` - Get users for an application (requires auth)
- `POST /api/applications/:appId/users` - Assign user to application (requires auth)
- `DELETE /api/applications/:appId/users/:userId` - Remove user from application (requires auth)

### App Roles (`/api/app-roles/*`)
- `GET /api/app-roles` - Get all app-role assignments (requires auth)
- `POST /api/app-roles` - Assign role to application (requires auth)
- `DELETE /api/app-roles/:id` - Remove role from application (requires auth)

### Configuration (`/api/config/*`)
- `GET /api/config/claims` - Get claim configuration
- `POST /api/config/claims` - Update claim configuration (requires auth)

### Health (`/health`)
- `GET /health` - Health check endpoint

## OpenAPI Specification

The OpenAPI 3.0 specification is available at:
```
http://localhost:4501/docs/json
```

You can use this JSON to:
- Import into API testing tools (Postman, Insomnia, etc.)
- Generate client SDKs
- Integrate with API gateways

## Troubleshooting

### Swagger UI not loading
- Ensure the backend server is running
- Check that port 4501 is accessible
- Verify no CORS issues in browser console

### Authentication not working
- Make sure you're using the correct token format
- Check that the token hasn't expired
- Verify the token was obtained from a successful login/register

### Endpoints showing errors
- Check server logs for detailed error messages
- Verify request body matches the schema
- Ensure required fields are provided

