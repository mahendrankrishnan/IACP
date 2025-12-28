import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service.js';
import { RoleService } from '../services/role.service.js';
import { generateToken } from '../utils/token.utils.js';
import type {
  RegisterBody,
  LoginBody,
  DecodeBody,
  JWTPayload,
} from '../types/index.js';
import {
  registerSchema,
  loginSchema,
  meSchema,
  decodeSchema,
} from '../schemas/auth.schemas.js';

export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService();
  const roleService = new RoleService();

  // Register new user
  fastify.post<{ Body: RegisterBody }>(
    '/api/auth/register',
    { schema: registerSchema },
    async (request, reply) => {
      const { username, email, password, phone } = request.body;

      // Check if user already exists
      const existingUserByEmail = await authService.findUserByEmail(email);
      const existingUserByUsername = await authService.findUserByUsername(username);
      const existingUserByPhone = await authService.findUserByPhone(phone);

      if (existingUserByEmail || existingUserByUsername || existingUserByPhone) {
        return reply.code(409).send({
          error: 'User with this email, username, or phone number already exists',
        });
      }

      // Create user
      const user = await authService.createUser(username, email, password, phone);

      // Get claim config and generate token
      const config = await authService.getClaimConfig();
      const token = await generateToken(fastify, user, config);

      return {
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
        },
      };
    }
  );

  // Login
  fastify.post<{ Body: LoginBody }>(
    '/api/auth/login',
    { schema: loginSchema },
    async (request, reply) => {
      const { email, phone, password } = request.body;

      // Find user by email
      const user = await authService.findUserByEmail(email);
      if (!user) {
        return reply.code(401).send({
          error: 'Invalid email, phone, or password',
        });
      }

      // Verify phone number matches
      if (user.phone !== phone) {
        return reply.code(401).send({
          error: 'Invalid email, phone, or password',
        });
      }

      // Verify password
      const isValid = await authService.verifyPassword(password, user.password!);
      if (!isValid) {
        return reply.code(401).send({
          error: 'Invalid email, phone, or password',
        });
      }

      // Get claim config and generate token
      const config = await authService.getClaimConfig();
      const token = await generateToken(fastify, user, config);

      // Get user's applications and roles
      const userApplicationsAndRoles = await roleService.getUserApplicationsAndRoles(user.id);

      return {
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
        },
        applications: userApplicationsAndRoles.applications,
      };
    }
  );

  // Verify token and get user info
  fastify.get(
    '/api/auth/me',
    { schema: meSchema },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
        const decoded = request.user as JWTPayload;

        // Find user from decoded token
        const userId = decoded.sub;
        const userEmail = decoded.email;

        let user;
        if (userId) {
          user = await authService.findUserById(userId);
        } else if (userEmail) {
          user = await authService.findUserByEmail(userEmail);
        }

        if (!user) {
          return reply.code(404).send({ error: 'User not found' });
        }

        return {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone,
          },
          claims: decoded,
        };
      } catch (err) {
        return reply.code(401).send({ error: 'Invalid or expired token' });
      }
    }
  );

  // Decode token (for debugging)
  fastify.post<{ Body: DecodeBody }>(
    '/api/auth/decode',
    { schema: decodeSchema },
    async (request, reply) => {
      const { token } = request.body;

      try {
        const decoded = fastify.jwt.verify(token) as JWTPayload;
        return { decoded };
      } catch (err: any) {
        return reply.code(401).send({
          error: 'Invalid token',
          details: err.message,
        });
      }
    }
  );
}

