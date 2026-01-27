import { FastifySchema } from 'fastify';

export const createWebhookSchema: FastifySchema = {
  description: 'Create a new webhook',
  tags: ['webhooks'],
  summary: 'Create webhook',
  body: {
    type: 'object',
    required: ['url', 'eventType'],
    properties: {
      url: {
        type: 'string',
        format: 'uri',
        description: 'Webhook URL endpoint',
        minLength: 1,
        maxLength: 500,
      },
      eventType: {
        type: 'string',
        enum: ['login', 'logout'],
        description: 'Event type to trigger webhook',
      },
      appId: {
        type: 'number',
        description: 'Optional application ID to associate webhook with',
      },
      secret: {
        type: 'string',
        description: 'Optional secret for signing webhook payloads',
        maxLength: 255,
      },
      isActive: {
        type: 'boolean',
        description: 'Whether the webhook is active',
        default: true,
      },
    },
  },
  response: {
    201: {
      description: 'Webhook created successfully',
      type: 'object',
      properties: {
        message: { type: 'string' },
        webhook: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            url: { type: 'string' },
            eventType: { type: 'string' },
            appId: { type: 'number', nullable: true },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
          },
        },
      },
    },
    400: {
      description: 'Validation error',
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
};

export const getWebhooksSchema: FastifySchema = {
  description: 'Get all webhooks',
  tags: ['webhooks'],
  summary: 'List webhooks',
  response: {
    200: {
      description: 'List of webhooks',
      type: 'object',
      properties: {
        webhooks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              url: { type: 'string' },
              eventType: { type: 'string' },
              appId: { type: 'number', nullable: true },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
  },
};

export const getWebhookSchema: FastifySchema = {
  description: 'Get webhook by ID',
  tags: ['webhooks'],
  summary: 'Get webhook',
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'number',
        description: 'Webhook ID',
      },
    },
  },
  response: {
    200: {
      description: 'Webhook details',
      type: 'object',
      properties: {
        webhook: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            url: { type: 'string' },
            eventType: { type: 'string' },
            appId: { type: 'number', nullable: true },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
          },
        },
      },
    },
    404: {
      description: 'Webhook not found',
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
};

export const updateWebhookSchema: FastifySchema = {
  description: 'Update a webhook',
  tags: ['webhooks'],
  summary: 'Update webhook',
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'number',
        description: 'Webhook ID',
      },
    },
  },
  body: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        format: 'uri',
        description: 'Webhook URL endpoint',
        minLength: 1,
        maxLength: 500,
      },
      eventType: {
        type: 'string',
        enum: ['login', 'logout'],
        description: 'Event type to trigger webhook',
      },
      appId: {
        type: 'number',
        description: 'Optional application ID to associate webhook with',
      },
      secret: {
        type: 'string',
        description: 'Optional secret for signing webhook payloads',
        maxLength: 255,
      },
      isActive: {
        type: 'boolean',
        description: 'Whether the webhook is active',
      },
    },
  },
  response: {
    200: {
      description: 'Webhook updated successfully',
      type: 'object',
      properties: {
        message: { type: 'string' },
        webhook: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            url: { type: 'string' },
            eventType: { type: 'string' },
            appId: { type: 'number', nullable: true },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
          },
        },
      },
    },
    404: {
      description: 'Webhook not found',
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
};

export const deleteWebhookSchema: FastifySchema = {
  description: 'Delete a webhook',
  tags: ['webhooks'],
  summary: 'Delete webhook',
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'number',
        description: 'Webhook ID',
      },
    },
  },
  response: {
    200: {
      description: 'Webhook deleted successfully',
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
    404: {
      description: 'Webhook not found',
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
};

