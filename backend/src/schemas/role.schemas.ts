import { FastifySchema } from 'fastify';

export const getAllRolesSchema: FastifySchema = {
  description: 'Get all roles',
  tags: ['roles'],
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
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
    401: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
};

export const getRoleByIdSchema: FastifySchema = {
  description: 'Get role by ID',
  tags: ['roles'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        pattern: '^[0-9]+$',
        description: 'Role ID',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        role: {
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

export const createRoleSchema: FastifySchema = {
  description: 'Create a new role',
  tags: ['roles'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['roleName'],
    properties: {
      roleName: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        description: 'Role name',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        role: {
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

export const updateRoleSchema: FastifySchema = {
  description: 'Update a role',
  tags: ['roles'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        pattern: '^[0-9]+$',
        description: 'Role ID',
      },
    },
  },
  body: {
    type: 'object',
    required: ['roleName'],
    properties: {
      roleName: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        description: 'Role name',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        role: {
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

export const deleteRoleSchema: FastifySchema = {
  description: 'Delete a role',
  tags: ['roles'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        pattern: '^[0-9]+$',
        description: 'Role ID',
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

export const getAllApplicationsSchema: FastifySchema = {
  description: 'Get all applications',
  tags: ['applications'],
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        applications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              appName: { type: 'string' },
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

export const createApplicationSchema: FastifySchema = {
  description: 'Create a new application',
  tags: ['applications'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['appName'],
    properties: {
      appName: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        description: 'Application name',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        application: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            appName: { type: 'string' },
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

export const getAllAppRolesSchema: FastifySchema = {
  description: 'Get all app-role assignments',
  tags: ['app-roles'],
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        appRoles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              appId: { type: 'number' },
              roleId: { type: 'number' },
              roleName: { type: 'string' },
              appName: { type: 'string' },
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

export const getAppRolesByAppIdSchema: FastifySchema = {
  description: 'Get roles assigned to an application',
  tags: ['app-roles'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['appId'],
    properties: {
      appId: {
        type: 'string',
        pattern: '^[0-9]+$',
        description: 'Application ID',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        appRoles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              appId: { type: 'number' },
              roleId: { type: 'number' },
              roleName: { type: 'string' },
              appName: { type: 'string' },
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

export const assignRoleToAppSchema: FastifySchema = {
  description: 'Assign a role to an application',
  tags: ['app-roles'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['appId'],
    properties: {
      appId: {
        type: 'string',
        pattern: '^[0-9]+$',
        description: 'Application ID',
      },
    },
  },
  body: {
    type: 'object',
    required: ['roleId'],
    properties: {
      roleId: {
        type: 'number',
        description: 'Role ID to assign',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        appRole: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            appId: { type: 'number' },
            roleId: { type: 'number' },
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
  },
};

export const removeRoleFromAppSchema: FastifySchema = {
  description: 'Remove a role from an application',
  tags: ['app-roles'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['appId', 'roleId'],
    properties: {
      appId: {
        type: 'string',
        pattern: '^[0-9]+$',
        description: 'Application ID',
      },
      roleId: {
        type: 'string',
        pattern: '^[0-9]+$',
        description: 'Role ID',
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

// User-Application assignment schemas
export const getAllUserApplicationsSchema: FastifySchema = {
  description: 'Get all user-application assignments',
  tags: ['user-applications'],
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        userApplications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              userId: { type: 'number' },
              appId: { type: 'number' },
              username: { type: 'string' },
              email: { type: 'string' },
              appName: { type: 'string' },
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

export const getUserApplicationsByAppIdSchema: FastifySchema = {
  description: 'Get users assigned to an application',
  tags: ['user-applications'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['appId'],
    properties: {
      appId: {
        type: 'string',
        pattern: '^[0-9]+$',
        description: 'Application ID',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        userApplications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              userId: { type: 'number' },
              appId: { type: 'number' },
              username: { type: 'string' },
              email: { type: 'string' },
              appName: { type: 'string' },
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

export const assignUserToAppSchema: FastifySchema = {
  description: 'Assign a user to an application',
  tags: ['user-applications'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['appId'],
    properties: {
      appId: {
        type: 'string',
        pattern: '^[0-9]+$',
        description: 'Application ID',
      },
    },
  },
  body: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: {
        type: 'number',
        description: 'User ID to assign',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        userApplication: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            userId: { type: 'number' },
            appId: { type: 'number' },
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
  },
};

export const removeUserFromAppSchema: FastifySchema = {
  description: 'Remove a user from an application',
  tags: ['user-applications'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['appId', 'userId'],
    properties: {
      appId: {
        type: 'string',
        pattern: '^[0-9]+$',
        description: 'Application ID',
      },
      userId: {
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

