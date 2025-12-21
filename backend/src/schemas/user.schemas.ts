import { FastifySchema } from 'fastify';

export const getAllUsersSchema: FastifySchema = {
  description: 'Get all users (requires authentication)',
  tags: ['users'],
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              username: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
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

export const createUserSchema: FastifySchema = {
  description: 'Create a new user (admin endpoint - requires authentication)',
  tags: ['users'],
  security: [{ bearerAuth: [] }],
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
        description: 'User phone number',
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
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            username: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
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
    409: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
};

export const updateUserSchema: FastifySchema = {
  description: 'Update a user (admin endpoint - requires authentication)',
  tags: ['users'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        pattern: '^[0-9]+$',
        description: 'User ID',
      },
    },
  },
  body: {
    type: 'object',
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
        description: 'User phone number',
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
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            username: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
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
    404: {
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
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
};

export const deleteUserSchema: FastifySchema = {
  description: 'Delete a user (admin endpoint - requires authentication)',
  tags: ['users'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        pattern: '^[0-9]+$',
        description: 'User ID',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
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
    404: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
};

export const getUserApplicationsAndRolesSchema: FastifySchema = {
  description: 'Get all applications and roles associated with a specific user',
  tags: ['users'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        pattern: '^[0-9]+$',
        description: 'User ID',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        userId: { type: 'number' },
        applications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              appName: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              roles: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    roleName: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
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
    404: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
};

