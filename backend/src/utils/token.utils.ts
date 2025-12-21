import { FastifyInstance } from 'fastify';
import { AuthService } from '../services/auth.service.js';

export async function generateToken(
  fastify: FastifyInstance,
  user: any,
  config: any
): Promise<string> {
  const authService = new AuthService();
  const payload = authService.generateTokenPayload(user, config);
  return fastify.jwt.sign(payload, { expiresIn: config.tokenExpiry });
}

