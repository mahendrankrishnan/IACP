import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import dotenv from 'dotenv';
import { registerRoutes } from './routes/index.js';

dotenv.config();

const fastify = Fastify({ logger: true });

// Here we are registering the plugins
await fastify.register(cors, {
  origin: true,
  credentials: true,
});

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'MK-Sakthi-Gokul-super-secret',
});

// Register Swagger for API documentation
await fastify.register(swagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'IACP API Documentation',
      description: `
# IACP - Identity, Auth, Claim, Provider API

A comprehensive authentication and authorization service that provides:
- **Identity Management**: User registration, authentication, and profile management
- **Authentication**: Secure login with email, phone, and password
- **Claim Configuration**: Dynamic JWT token claims configuration
- **Provider Services**: Role and application management

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
\`\`\`
Authorization: Bearer <your-token>
\`\`\`

## Base URL

The API is available at: \`http://localhost:${process.env.PORT || 4501}\`

## API Documentation

Interactive Swagger UI is available at: \`http://localhost:${process.env.PORT || 4501}/docs\`

## Getting Started

1. Register a new user at \`POST /api/auth/register\`
2. Login at \`POST /api/auth/login\` to get your JWT token
3. Use the token to access protected endpoints
4. Visit \`/docs\` for interactive API documentation
      `,
      version: '1.0.0',
      contact: {
        name: 'IACP API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4501}`,
        description: 'Development server',
      },
      {
        url: `http://0.0.0.0:${process.env.PORT || 4501}`,
        description: 'Docker container server',
      },
    ],
    tags: [
      { name: 'auth', description: 'Authentication endpoints' },
      { name: 'users', description: 'User management endpoints' },
      { name: 'roles', description: 'Role management endpoints' },
      { name: 'applications', description: 'Application management endpoints' },
      { name: 'config', description: 'Configuration endpoints' },
      { name: 'health', description: 'Health check endpoints' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from login or register endpoint',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'User ID' },
            username: { type: 'string', description: 'Username' },
            email: { type: 'string', description: 'Email address' },
            phone: { type: 'string', description: 'Phone number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
});

await fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
  },
  staticCSP: true,
  transformStaticCSP: (header: string) => header,
});

// Register routes
await fastify.register(registerRoutes);

// Here we are starting the server and listening to the port
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 4501;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 ICAP Server is running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

