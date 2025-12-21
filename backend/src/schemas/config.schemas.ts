import { FastifySchema } from 'fastify';

export const getClaimConfigSchema: FastifySchema = {
  description: 'Get claim configuration',
  tags: ['config'],
  response: {
    200: {
      type: 'object',
      properties: {
        Username: { type: 'boolean' },
        Email: { type: 'boolean' },
        UserId: { type: 'boolean' },
        tokenExpiry: { type: 'string' },
      },
    },
  },
};

export const updateClaimConfigSchema: FastifySchema = {
  description: 'Update claim configuration (requires authentication)',
  tags: ['config'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    properties: {
      Username: {
        type: 'boolean',
        description: 'Include username in JWT token',
      },
      Email: {
        type: 'boolean',
        description: 'Include email in JWT token',
      },
      UserId: {
        type: 'boolean',
        description: 'Include user ID in JWT token',
      },
      tokenExpiry: {
        type: 'string',
        pattern: '^[0-9]+[smhd]$',
        description: 'Token expiry (e.g., 24h, 30m, 7d)',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        config: {
          type: 'object',
          properties: {
            Username: { type: 'boolean' },
            Email: { type: 'boolean' },
            UserId: { type: 'boolean' },
            tokenExpiry: { type: 'string' },
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
  },
};

