import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service.js';
import type { UpdateClaimConfigBody } from '../types/index.js';
import {
  getClaimConfigSchema,
  updateClaimConfigSchema,
} from '../schemas/config.schemas.js';

export async function configRoutes(fastify: FastifyInstance) {
  const authService = new AuthService();

  // Get claim configuration
  fastify.get(
    '/api/config/claims',
    { schema: getClaimConfigSchema },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const config = await authService.getClaimConfig();
      return config;
    }
  );

  // Update claim configuration
  fastify.post<{ Body: UpdateClaimConfigBody }>(
    '/api/config/claims',
    { schema: updateClaimConfigSchema },
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      const { Username, Email, UserId, tokenExpiry } = request.body;

      const config = await authService.updateClaimConfig({
        Username,
        Email,
        UserId,
        tokenExpiry,
      });

      return { message: 'Claim configuration updated', config };
    }
  );
}

