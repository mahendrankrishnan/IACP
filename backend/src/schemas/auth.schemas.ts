import { FastifySchema } from 'fastify';

export const registerSchema: FastifySchema = {
  description: 'Register a new user',
  tags: ['auth'],
  body: {
    type: 'object',
    required: ['username', 'email', 'phone', 'password'],
    properties: {
      username: {
        type: 'string',
        minLength: 3,
        maxLength: 255,
        pattern: '^[a-zA-Z0-9_]+$',
        description: 'Username (alphanumeric and underscore only)',
      },
      email: {
        type: 'string',
        format: 'email',
        maxLength: 255,
        description: 'User email address',
      },
      phone: {
        type: 'string',
        maxLength: 20,
        pattern: '^[+]?[(]?[0-9]{1,4}[)]?[-\\s.]?[(]?[0-9]{1,4}[)]?[-\\s.]?[0-9]{1,9}$',
        description: 'Phone number (required)',
      },
      password: {
        type: 'string',
        minLength: 6,
        maxLength: 255,
        description: 'User password (minimum 6 characters)',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            username: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
          },
        },
      },
    },
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
    409: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
};

export const loginSchema: FastifySchema = {
  description: 'Login with email, phone and password',
  tags: ['auth'],
  body: {
    type: 'object',
    required: ['email', 'phone', 'password'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        maxLength: 255,
        description: 'User email address',
      },
      phone: {
        type: 'string',
        maxLength: 20,
        pattern: '^[+]?[(]?[0-9]{1,4}[)]?[-\\s.]?[(]?[0-9]{1,4}[)]?[-\\s.]?[0-9]{1,9}$',
        description: 'User phone number',
      },
      password: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        description: 'User password',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            username: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
          },
        },
      },
    },
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
    401: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
};

export const meSchema: FastifySchema = {
  description: 'Get current user information from JWT token',
  tags: ['auth'],
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            username: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
          },
        },
        claims: {
          type: 'object',
          properties: {
            sub: { type: 'number' },
            username: { type: 'string' },
            email: { type: 'string' },
            iat: { type: 'number' },
            exp: { type: 'number' },
          },
        },
      },
    },
    401: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
    404: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
};

export const decodeSchema: FastifySchema = {
  description: 'Decode JWT token (for debugging)',
  tags: ['auth'],
  body: {
    type: 'object',
    required: ['token'],
    properties: {
      token: {
        type: 'string',
        description: 'JWT token to decode',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        decoded: {
          type: 'object',
          properties: {
            sub: { type: 'number' },
            username: { type: 'string' },
            email: { type: 'string' },
            iat: { type: 'number' },
            exp: { type: 'number' },
          },
        },
      },
    },
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
    401: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        details: { type: 'string' },
      },
    },
  },
};

