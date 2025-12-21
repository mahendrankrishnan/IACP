import { FastifySchema } from 'fastify';

export const healthCheckSchema: FastifySchema = {
  description: 'Health check endpoint',
  tags: ['health'],
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        service: { type: 'string' },
      },
    },
  },
};

