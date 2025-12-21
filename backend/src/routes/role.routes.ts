import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { RoleService } from '../services/role.service.js';
import type { CreateRoleBody, UpdateRoleBody, AssignRoleToAppBody, AssignUserToAppBody } from '../types/index.js';
import {
  getAllRolesSchema,
  getRoleByIdSchema,
  createRoleSchema,
  updateRoleSchema,
  deleteRoleSchema,
  getAllApplicationsSchema,
  createApplicationSchema,
  getAllAppRolesSchema,
  getAppRolesByAppIdSchema,
  assignRoleToAppSchema,
  removeRoleFromAppSchema,
  getAllUserApplicationsSchema,
  getUserApplicationsByAppIdSchema,
  assignUserToAppSchema,
  removeUserFromAppSchema,
} from '../schemas/role.schemas.js';

export async function roleRoutes(fastify: FastifyInstance) {
  const roleService = new RoleService();

  // Role CRUD endpoints
  fastify.get(
    '/api/roles',
    { schema: getAllRolesSchema },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const roles = await roleService.getAllRoles();
      return { roles };
    }
  );

  fastify.get<{ Params: { id: string } }>(
    '/api/roles/:id',
    { schema: getRoleByIdSchema },
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const roleId = parseInt(request.params.id);
      if (isNaN(roleId)) {
        return reply.code(400).send({ error: 'Invalid role ID' });
      }

      const role = await roleService.getRoleById(roleId);
      if (!role) {
        return reply.code(404).send({ error: 'Role not found' });
      }

      return { role };
    }
  );

  fastify.post<{ Body: CreateRoleBody }>(
    '/api/roles',
    { schema: createRoleSchema },
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { roleName } = request.body;

      // Check if role already exists
      const existingRole = await roleService.getRoleByName(roleName);
      if (existingRole) {
        return reply.code(409).send({
          error: 'Role with this name already exists',
        });
      }

      const role = await roleService.createRole(roleName);
      return {
        message: 'Role created successfully',
        role,
      };
    }
  );

  fastify.put<{ Params: { id: string }; Body: UpdateRoleBody }>(
    '/api/roles/:id',
    { schema: updateRoleSchema },
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const roleId = parseInt(request.params.id);
      const { roleName } = request.body;

      if (isNaN(roleId)) {
        return reply.code(400).send({ error: 'Invalid role ID' });
      }

      if (!roleName) {
        return reply.code(400).send({ error: 'Role name is required' });
      }

      // Check if role exists
      const existingRole = await roleService.getRoleById(roleId);
      if (!existingRole) {
        return reply.code(404).send({ error: 'Role not found' });
      }

      // Check if new name conflicts with another role
      const roleWithName = await roleService.getRoleByName(roleName);
      if (roleWithName && roleWithName.id !== roleId) {
        return reply.code(409).send({
          error: 'Role with this name already exists',
        });
      }

      const updatedRole = await roleService.updateRole(roleId, roleName);
      if (!updatedRole) {
        return reply.code(500).send({ error: 'Failed to update role' });
      }

      return {
        message: 'Role updated successfully',
        role: updatedRole,
      };
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    '/api/roles/:id',
    { schema: deleteRoleSchema },
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const roleId = parseInt(request.params.id);
      if (isNaN(roleId)) {
        return reply.code(400).send({ error: 'Invalid role ID' });
      }

      const deleted = await roleService.deleteRole(roleId);
      if (!deleted) {
        return reply.code(404).send({ error: 'Role not found' });
      }

      return { message: 'Role deleted successfully' };
    }
  );

  // Application CRUD endpoints
  fastify.get(
    '/api/applications',
    { schema: getAllApplicationsSchema },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const applications = await roleService.getAllApplications();
      return { applications };
    }
  );

  fastify.post<{ Body: { appName: string } }>(
    '/api/applications',
    { schema: createApplicationSchema },
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { appName } = request.body;

      // Check if application already exists
      const existingApp = await roleService.getApplicationByName(appName);
      if (existingApp) {
        return reply.code(409).send({
          error: 'Application with this name already exists',
        });
      }

      const application = await roleService.createApplication(appName);
      return {
        message: 'Application created successfully',
        application,
      };
    }
  );

  // App-Role assignment endpoints
  fastify.get(
    '/api/app-roles',
    { schema: getAllAppRolesSchema },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const appRoles = await roleService.getAllAppRoles();
      return { appRoles };
    }
  );

  fastify.get<{ Params: { appId: string } }>(
    '/api/applications/:appId/roles',
    { schema: getAppRolesByAppIdSchema },
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const appId = parseInt(request.params.appId);
      if (isNaN(appId)) {
        return reply.code(400).send({ error: 'Invalid application ID' });
      }

      const appRoles = await roleService.getAppRoles(appId);
      return { appRoles };
    }
  );

  fastify.post<{ Params: { appId: string }; Body: AssignRoleToAppBody }>(
    '/api/applications/:appId/roles',
    { schema: assignRoleToAppSchema },
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const appId = parseInt(request.params.appId);
      const { roleId } = request.body;

      if (isNaN(appId)) {
        return reply.code(400).send({ error: 'Invalid application ID' });
      }

      // Verify application exists
      const application = await roleService.getApplicationById(appId);
      if (!application) {
        return reply.code(404).send({ error: 'Application not found' });
      }

      // Verify role exists
      const role = await roleService.getRoleById(roleId);
      if (!role) {
        return reply.code(404).send({ error: 'Role not found' });
      }

      const appRole = await roleService.assignRoleToApp(appId, roleId);
      if (!appRole) {
        return reply.code(500).send({ error: 'Failed to assign role to application' });
      }

      return {
        message: 'Role assigned to application successfully',
        appRole,
      };
    }
  );

  fastify.delete<{ Params: { appId: string; roleId: string } }>(
    '/api/applications/:appId/roles/:roleId',
    { schema: removeRoleFromAppSchema },
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const appId = parseInt(request.params.appId);
      const roleId = parseInt(request.params.roleId);

      if (isNaN(appId) || isNaN(roleId)) {
        return reply.code(400).send({ error: 'Invalid application ID or role ID' });
      }

      const removed = await roleService.removeRoleFromApp(appId, roleId);
      if (!removed) {
        return reply.code(404).send({ error: 'App-role assignment not found' });
      }

      return { message: 'Role removed from application successfully' };
    }
  );

  // User-Application assignment endpoints
  fastify.get(
    '/api/user-applications',
    { schema: getAllUserApplicationsSchema },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const userApplications = await roleService.getAllUserApplications();
      return { userApplications };
    }
  );

  fastify.get<{ Params: { appId: string } }>(
    '/api/applications/:appId/users',
    { schema: getUserApplicationsByAppIdSchema },
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const appId = parseInt(request.params.appId);
      if (isNaN(appId)) {
        return reply.code(400).send({ error: 'Invalid application ID' });
      }

      const userApplications = await roleService.getUserApplications(appId);
      return { userApplications };
    }
  );

  fastify.post<{ Params: { appId: string }; Body: AssignUserToAppBody }>(
    '/api/applications/:appId/users',
    { schema: assignUserToAppSchema },
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const appId = parseInt(request.params.appId);
      const { userId } = request.body;

      if (isNaN(appId)) {
        return reply.code(400).send({ error: 'Invalid application ID' });
      }

      // Verify application exists
      const application = await roleService.getApplicationById(appId);
      if (!application) {
        return reply.code(404).send({ error: 'Application not found' });
      }

      // Verify user exists (using AuthService)
      const { AuthService } = await import('../services/auth.service.js');
      const authService = new AuthService();
      const user = await authService.findUserById(userId);
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      const userApplication = await roleService.assignUserToApp(appId, userId);
      if (!userApplication) {
        return reply.code(500).send({ error: 'Failed to assign user to application' });
      }

      return {
        message: 'User assigned to application successfully',
        userApplication,
      };
    }
  );

  fastify.delete<{ Params: { appId: string; userId: string } }>(
    '/api/applications/:appId/users/:userId',
    { schema: removeUserFromAppSchema },
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const appId = parseInt(request.params.appId);
      const userId = parseInt(request.params.userId);

      if (isNaN(appId) || isNaN(userId)) {
        return reply.code(400).send({ error: 'Invalid application ID or user ID' });
      }

      const removed = await roleService.removeUserFromApp(appId, userId);
      if (!removed) {
        return reply.code(404).send({ error: 'User-application assignment not found' });
      }

      return { message: 'User removed from application successfully' };
    }
  );
}

