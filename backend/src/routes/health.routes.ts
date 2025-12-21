import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { healthCheckSchema } from '../schemas/health.schemas.js';

export async function healthRoutes(fastify: FastifyInstance) {
  // Health check
  fastify.get(
    '/health',
    { schema: healthCheckSchema },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return { status: 'ok', service: 'IACP - Identity, Auth, Claim, Provider' };
    }
  );
}

