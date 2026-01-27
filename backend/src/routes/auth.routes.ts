import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service.js';
import { RoleService } from '../services/role.service.js';
import { WebhookService } from '../services/webhook.service.js';
import { emailService } from '../services/email.service.js';
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
  logoutSchema,
} from '../schemas/auth.schemas.js';

export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService();
  const roleService = new RoleService();
  const webhookService = new WebhookService();

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

      // Send welcome email (non-blocking)
      emailService.sendWelcomeEmail(user.email, user.username).catch((err) => {
        console.error('Failed to send welcome email:', err);
      });

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
      console.log('[Login] Incoming login request from:', request.ip, request.headers['user-agent']);
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

      console.log('[Login] Login successful for user:', user.id, user.email);
      console.log('[Login] User has access to', userApplicationsAndRoles.applications.length, 'application(s)');

      // Determine request source
      const userAgent = request.headers['user-agent'] || 'Unknown';
      const origin = request.headers['origin'] || request.headers['referer'] || 'Direct';
      const isExternal = !userAgent.includes('Mozilla') || origin !== 'http://localhost:4500';
      const source = isExternal ? 'external' : 'internal';

      console.log('[Login] Request source:', source, '| Origin:', origin, '| User-Agent:', userAgent);

      // Trigger webhooks for login event (non-blocking)
      // Trigger global webhooks (no appId)
      console.log('[Webhook] Triggering login webhooks for user:', user.id, 'from', source, 'application');
      webhookService.triggerWebhooks('login', {
        event: 'login',
        timestamp: new Date().toISOString(),
        source: source,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
        },
        metadata: {
          origin: origin,
          userAgent: userAgent,
          ip: request.ip,
        },
      }).catch((err) => {
        console.error('[Webhook] Error triggering login webhooks:', err);
      });

      // Trigger webhooks for each application the user has access to
      if (userApplicationsAndRoles.applications.length > 0) {
        userApplicationsAndRoles.applications.forEach((app) => {
          console.log('[Webhook] Triggering app-specific webhook for app:', app.id, app.appName);
          webhookService.triggerWebhooks('login', {
            event: 'login',
            timestamp: new Date().toISOString(),
            source: source,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              phone: user.phone,
            },
            application: {
              id: app.id,
              appName: app.appName,
            },
            metadata: {
              origin: origin,
              userAgent: userAgent,
              ip: request.ip,
            },
          }, app.id).catch((err) => {
            console.error(`[Webhook] Error triggering login webhook for app ${app.id}:`, err);
          });
        });
      }

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

  // Logout
  fastify.post<{ Querystring: { appId?: string } }>(
    '/api/auth/logout',
    { schema: logoutSchema },
    async (request: FastifyRequest<{ Querystring: { appId?: string } }>, reply: FastifyReply) => {
      try {
        console.log('[Logout] Incoming logout request from:', request.ip, request.headers['user-agent']);
        console.log('[Logout] Authorization header present:', !!request.headers['authorization']);
        
        await request.jwtVerify();
        const decoded = request.user as JWTPayload;
        console.log('[Logout] Token verified successfully, user ID:', decoded.sub);

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

        // Determine request source
        const userAgent = request.headers['user-agent'] || 'Unknown';
        const origin = request.headers['origin'] || request.headers['referer'] || 'Direct';
        const isExternal = !userAgent.includes('Mozilla') || origin !== 'http://localhost:4500';
        const source = isExternal ? 'external' : 'internal';

        console.log('[Logout] Logout successful for user:', user.id, user.email);
        console.log('[Logout] Request source:', source, '| Origin:', origin, '| User-Agent:', userAgent);

        // Get user's applications if appId is provided
        let application = null;
        const appIdParam = request.query.appId;
        const appId = appIdParam ? parseInt(appIdParam, 10) : undefined;
        if (appId && !isNaN(appId)) {
          const userApplicationsAndRoles = await roleService.getUserApplicationsAndRoles(user.id);
          const app = userApplicationsAndRoles.applications.find((a) => a.id === appId);
          if (app) {
            application = {
              id: app.id,
              appName: app.appName,
            };
            console.log('[Logout] User has access to application:', app.id, app.appName);
          }
        }

        // Trigger global webhooks for logout event (non-blocking)
        console.log('[Webhook] Triggering logout webhooks for user:', user.id, 'from', source, 'application');
        webhookService.triggerWebhooks('logout', {
          event: 'logout',
          timestamp: new Date().toISOString(),
          source: source,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone,
          },
          application: application || undefined,
          metadata: {
            origin: origin,
            userAgent: userAgent,
            ip: request.ip,
          },
        }).catch((err) => {
          console.error('[Webhook] Error triggering global logout webhooks:', err);
        });

        // Trigger app-specific webhook if appId is provided
        if (appId && !isNaN(appId) && application) {
          console.log('[Webhook] Triggering app-specific logout webhook for app:', appId, application.appName);
          webhookService.triggerWebhooks('logout', {
            event: 'logout',
            timestamp: new Date().toISOString(),
            source: source,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              phone: user.phone,
            },
            application: application,
            metadata: {
              origin: origin,
              userAgent: userAgent,
              ip: request.ip,
            },
          }, appId).catch((err) => {
            console.error(`[Webhook] Error triggering logout webhook for app ${appId}:`, err);
          });
        }

        return {
          message: 'Logout successful',
        };
      } catch (err: any) {
        console.error('[Logout] Logout failed:', err.message);
        console.error('[Logout] Error details:', err);
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

