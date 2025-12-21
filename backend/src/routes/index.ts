import { FastifyInstance } from 'fastify';
import { healthRoutes } from './health.routes.js';
import { configRoutes } from './config.routes.js';
import { authRoutes } from './auth.routes.js';
import { userRoutes } from './user.routes.js';
import { roleRoutes } from './role.routes.js';

export async function registerRoutes(fastify: FastifyInstance) {
  await fastify.register(healthRoutes);
  await fastify.register(configRoutes);
  await fastify.register(authRoutes);
  await fastify.register(userRoutes);
  await fastify.register(roleRoutes);
}

