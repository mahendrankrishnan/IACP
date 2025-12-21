import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service.js';
import { RoleService } from '../services/role.service.js';
import type { RegisterBody, UpdateUserBody } from '../types/index.js';
import {
  getAllUsersSchema,
  createUserSchema,
  updateUserSchema,
  deleteUserSchema,
  getUserApplicationsAndRolesSchema,
} from '../schemas/user.schemas.js';

export async function userRoutes(fastify: FastifyInstance) {
  const authService = new AuthService();
  const roleService = new RoleService();

  // Get all users (requires authentication)
  fastify.get(
    '/api/users',
    { schema: getAllUsersSchema },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const users = await authService.getAllUsers();
      return { users };
    }
  );

  // Create user (admin endpoint - requires authentication)
  fastify.post<{ Body: RegisterBody }>(
    '/api/users',
    { schema: createUserSchema },
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { username, email, phone, password } = request.body;

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

      return {
        message: 'User created successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    }
  );

  // Update user (admin endpoint - requires authentication)
  fastify.put<{ Params: { id: string }; Body: UpdateUserBody }>(
    '/api/users/:id',
    { schema: updateUserSchema },
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const userId = parseInt(request.params.id);
      const { username, email, phone, password } = request.body;

      // Check if user exists
      const existingUser = await authService.findUserById(userId);
      if (!existingUser) {
        return reply.code(404).send({ error: 'User not found' });
      }

      // Check if email, username, or phone is being changed and if it conflicts with another user
      if (email && email !== existingUser.email) {
        const userWithEmail = await authService.findUserByEmail(email);
        if (userWithEmail) {
          return reply.code(409).send({
            error: 'User with this email already exists',
          });
        }
      }

      if (username && username !== existingUser.username) {
        const userWithUsername = await authService.findUserByUsername(username);
        if (userWithUsername) {
          return reply.code(409).send({
            error: 'User with this username already exists',
          });
        }
      }

      if (phone && phone !== existingUser.phone) {
        const userWithPhone = await authService.findUserByPhone(phone);
        if (userWithPhone) {
          return reply.code(409).send({
            error: 'User with this phone number already exists',
          });
        }
      }

      // Update user
      const updatedUser = await authService.updateUser(userId, {
        username,
        email,
        phone,
        password,
      });

      if (!updatedUser) {
        return reply.code(500).send({ error: 'Failed to update user' });
      }

      return {
        message: 'User updated successfully',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          phone: updatedUser.phone,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
      };
    }
  );

  // Delete user (admin endpoint - requires authentication)
  fastify.delete<{ Params: { id: string } }>(
    '/api/users/:id',
    { schema: deleteUserSchema },
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const userId = parseInt(request.params.id);
      if (isNaN(userId)) {
        return reply.code(400).send({ error: 'Invalid user ID' });
      }

      // Check if user exists
      const existingUser = await authService.findUserById(userId);
      if (!existingUser) {
        return reply.code(404).send({ error: 'User not found' });
      }

      const deleted = await authService.deleteUser(userId);
      if (!deleted) {
        return reply.code(500).send({ error: 'Failed to delete user' });
      }

      return { message: 'User deleted successfully' };
    }
  );

  // Get all applications and roles associated with a specific user
  fastify.get<{ Params: { id: string } }>(
    '/api/users/:id/applications-roles',
    { schema: getUserApplicationsAndRolesSchema },
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const userId = parseInt(request.params.id);
      if (isNaN(userId)) {
        return reply.code(400).send({ error: 'Invalid user ID' });
      }

      // Verify user exists
      const user = await authService.findUserById(userId);
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      const result = await roleService.getUserApplicationsAndRoles(userId);
      return result;
    }
  );
}

