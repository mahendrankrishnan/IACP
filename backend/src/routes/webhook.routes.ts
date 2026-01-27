import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { WebhookService } from '../services/webhook.service.js';
import {
  createWebhookSchema,
  getWebhooksSchema,
  getWebhookSchema,
  updateWebhookSchema,
  deleteWebhookSchema,
} from '../schemas/webhook.schemas.js';

interface CreateWebhookBody {
  url: string;
  eventType: 'login' | 'logout';
  appId?: number;
  secret?: string;
  isActive?: boolean;
}

interface UpdateWebhookBody {
  url?: string;
  eventType?: 'login' | 'logout';
  appId?: number;
  secret?: string;
  isActive?: boolean;
}

interface WebhookParams {
  id: number;
}

export async function webhookRoutes(fastify: FastifyInstance) {
  const webhookService = new WebhookService();

  // Create webhook
  fastify.post<{ Body: CreateWebhookBody }>(
    '/api/webhooks',
    { schema: createWebhookSchema },
    async (request, reply) => {
      const { url, eventType, appId, secret, isActive = true } = request.body;

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return reply.code(400).send({
          error: 'Invalid URL format',
        });
      }

      const webhook = await webhookService.createWebhook({
        url,
        eventType,
        appId: appId || null,
        secret: secret || null,
        isActive,
      });

      return reply.code(201).send({
        message: 'Webhook created successfully',
        webhook: {
          id: webhook.id,
          url: webhook.url,
          eventType: webhook.eventType,
          appId: webhook.appId,
          isActive: webhook.isActive,
          createdAt: webhook.createdAt,
          updatedAt: webhook.updatedAt,
        },
      });
    }
  );

  // Get all webhooks
  fastify.get(
    '/api/webhooks',
    { schema: getWebhooksSchema },
    async (request, reply) => {
      const webhooks = await webhookService.getAllWebhooks();

      // Don't expose secrets in response
      const sanitizedWebhooks = webhooks.map((webhook) => ({
        id: webhook.id,
        url: webhook.url,
        eventType: webhook.eventType,
        appId: webhook.appId,
        isActive: webhook.isActive,
        createdAt: webhook.createdAt,
        updatedAt: webhook.updatedAt,
      }));

      return {
        webhooks: sanitizedWebhooks,
      };
    }
  );

  // Get webhook by ID
  fastify.get<{ Params: WebhookParams }>(
    '/api/webhooks/:id',
    { schema: getWebhookSchema },
    async (request, reply) => {
      const { id } = request.params;
      const webhook = await webhookService.getWebhookById(id);

      if (!webhook) {
        return reply.code(404).send({
          error: 'Webhook not found',
        });
      }

      // Don't expose secret in response
      return {
        webhook: {
          id: webhook.id,
          url: webhook.url,
          eventType: webhook.eventType,
          appId: webhook.appId,
          isActive: webhook.isActive,
          createdAt: webhook.createdAt,
          updatedAt: webhook.updatedAt,
        },
      };
    }
  );

  // Update webhook
  fastify.put<{ Params: WebhookParams; Body: UpdateWebhookBody }>(
    '/api/webhooks/:id',
    { schema: updateWebhookSchema },
    async (request, reply) => {
      const { id } = request.params;
      const updateData = request.body;

      // Validate URL if provided
      if (updateData.url) {
        try {
          new URL(updateData.url);
        } catch {
          return reply.code(400).send({
            error: 'Invalid URL format',
          });
        }
      }

      const webhook = await webhookService.updateWebhook(id, updateData);

      if (!webhook) {
        return reply.code(404).send({
          error: 'Webhook not found',
        });
      }

      return {
        message: 'Webhook updated successfully',
        webhook: {
          id: webhook.id,
          url: webhook.url,
          eventType: webhook.eventType,
          appId: webhook.appId,
          isActive: webhook.isActive,
          createdAt: webhook.createdAt,
          updatedAt: webhook.updatedAt,
        },
      };
    }
  );

  // Delete webhook
  fastify.delete<{ Params: WebhookParams }>(
    '/api/webhooks/:id',
    { schema: deleteWebhookSchema },
    async (request, reply) => {
      const { id } = request.params;
      const deleted = await webhookService.deleteWebhook(id);

      if (!deleted) {
        return reply.code(404).send({
          error: 'Webhook not found',
        });
      }

      return {
        message: 'Webhook deleted successfully',
      };
    }
  );

  // Get webhook events (audit log)
  fastify.get(
    '/api/webhooks/events',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const query = request.query as {
        webhookId?: string;
        eventType?: string;
        userId?: string;
        status?: string;
        limit?: string;
      };

      const filters: any = {};
      if (query.webhookId) filters.webhookId = parseInt(query.webhookId, 10);
      if (query.eventType) filters.eventType = query.eventType;
      if (query.userId) filters.userId = parseInt(query.userId, 10);
      if (query.status) filters.status = query.status;
      if (query.limit) filters.limit = parseInt(query.limit, 10);

      const events = await webhookService.getWebhookEvents(filters);

      return {
        events: events.map((event) => ({
          id: event.id,
          webhookId: event.webhookId,
          eventType: event.eventType,
          userId: event.userId,
          appId: event.appId,
          status: event.status,
          statusCode: event.statusCode,
          responseTime: event.responseTime,
          errorMessage: event.errorMessage,
          triggeredAt: event.triggeredAt,
        })),
        count: events.length,
      };
    }
  );

  // Get webhook events for a specific webhook
  fastify.get<{ Params: { id: number } }>(
    '/api/webhooks/:id/events',
    async (request, reply) => {
      const { id } = request.params;
      const query = request.query as { limit?: string };

      const events = await webhookService.getWebhookEvents({
        webhookId: id,
        limit: query.limit ? parseInt(query.limit, 10) : undefined,
      });

      return {
        webhookId: id,
        events: events.map((event) => ({
          id: event.id,
          eventType: event.eventType,
          userId: event.userId,
          appId: event.appId,
          status: event.status,
          statusCode: event.statusCode,
          responseTime: event.responseTime,
          errorMessage: event.errorMessage,
          triggeredAt: event.triggeredAt,
        })),
        count: events.length,
      };
    }
  );
}

