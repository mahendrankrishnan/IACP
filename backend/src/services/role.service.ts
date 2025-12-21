import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { roles, applications, appRoles, userApplications, users } from '../db/schema.js';
import type { Role, Application, AppRole, UserApplication } from '../db/schema.js';

export class RoleService {
  // Role CRUD operations
  async getAllRoles(): Promise<Role[]> {
    return await db.select().from(roles).orderBy(roles.roleName);
  }

  async getRoleById(id: number): Promise<Role | null> {
    const result = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    return result[0] || null;
  }

  async getRoleByName(roleName: string): Promise<Role | null> {
    const result = await db.select().from(roles).where(eq(roles.roleName, roleName)).limit(1);
    return result[0] || null;
  }

  async createRole(roleName: string): Promise<Role> {
    const result = await db
      .insert(roles)
      .values({ roleName })
      .returning();
    return result[0];
  }

  async updateRole(id: number, roleName: string): Promise<Role | null> {
    const result = await db
      .update(roles)
      .set({ roleName, updatedAt: new Date() })
      .where(eq(roles.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteRole(id: number): Promise<boolean> {
    const result = await db.delete(roles).where(eq(roles.id, id)).returning();
    return result.length > 0;
  }

  // Application CRUD operations
  async getAllApplications(): Promise<Application[]> {
    return await db.select().from(applications).orderBy(applications.appName);
  }

  async getApplicationById(id: number): Promise<Application | null> {
    const result = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
    return result[0] || null;
  }

  async getApplicationByName(appName: string): Promise<Application | null> {
    const result = await db.select().from(applications).where(eq(applications.appName, appName)).limit(1);
    return result[0] || null;
  }

  async createApplication(appName: string): Promise<Application> {
    const result = await db
      .insert(applications)
      .values({ appName })
      .returning();
    return result[0];
  }

  async updateApplication(id: number, appName: string): Promise<Application | null> {
    const result = await db
      .update(applications)
      .set({ appName, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteApplication(id: number): Promise<boolean> {
    const result = await db.delete(applications).where(eq(applications.id, id)).returning();
    return result.length > 0;
  }

  // App-Role assignment operations
  async getAppRoles(appId: number): Promise<Array<AppRole & { roleName: string; appName: string }>> {
    const result = await db
      .select({
        id: appRoles.id,
        appId: appRoles.appId,
        roleId: appRoles.roleId,
        roleName: roles.roleName,
        appName: applications.appName,
        createdAt: appRoles.createdAt,
        updatedAt: appRoles.updatedAt,
      })
      .from(appRoles)
      .innerJoin(roles, eq(appRoles.roleId, roles.id))
      .innerJoin(applications, eq(appRoles.appId, applications.id))
      .where(eq(appRoles.appId, appId));
    return result;
  }

  async getAllAppRoles(): Promise<Array<AppRole & { roleName: string; appName: string }>> {
    const result = await db
      .select({
        id: appRoles.id,
        appId: appRoles.appId,
        roleId: appRoles.roleId,
        roleName: roles.roleName,
        appName: applications.appName,
        createdAt: appRoles.createdAt,
        updatedAt: appRoles.updatedAt,
      })
      .from(appRoles)
      .innerJoin(roles, eq(appRoles.roleId, roles.id))
      .innerJoin(applications, eq(appRoles.appId, applications.id));
    return result;
  }

  async assignRoleToApp(appId: number, roleId: number): Promise<AppRole | null> {
    // Check if assignment already exists
    const existing = await db
      .select()
      .from(appRoles)
      .where(and(eq(appRoles.appId, appId), eq(appRoles.roleId, roleId)))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const result = await db
      .insert(appRoles)
      .values({ appId, roleId })
      .returning();
    return result[0] || null;
  }

  async removeRoleFromApp(appId: number, roleId: number): Promise<boolean> {
    const result = await db
      .delete(appRoles)
      .where(and(eq(appRoles.appId, appId), eq(appRoles.roleId, roleId)))
      .returning();
    return result.length > 0;
  }

  async getRolesByAppId(appId: number): Promise<Role[]> {
    const result = await db
      .select({
        id: roles.id,
        roleName: roles.roleName,
        createdAt: roles.createdAt,
        updatedAt: roles.updatedAt,
      })
      .from(appRoles)
      .innerJoin(roles, eq(appRoles.roleId, roles.id))
      .where(eq(appRoles.appId, appId));
    return result;
  }

  async getApplicationsByRoleId(roleId: number): Promise<Application[]> {
    const result = await db
      .select({
        id: applications.id,
        appName: applications.appName,
        createdAt: applications.createdAt,
        updatedAt: applications.updatedAt,
      })
      .from(appRoles)
      .innerJoin(applications, eq(appRoles.appId, applications.id))
      .where(eq(appRoles.roleId, roleId));
    return result;
  }

  // User-Application assignment operations
  async getUserApplications(appId: number): Promise<Array<UserApplication & { username: string; email: string; appName: string }>> {
    const result = await db
      .select({
        id: userApplications.id,
        userId: userApplications.userId,
        appId: userApplications.appId,
        username: users.username,
        email: users.email,
        appName: applications.appName,
        createdAt: userApplications.createdAt,
        updatedAt: userApplications.updatedAt,
      })
      .from(userApplications)
      .innerJoin(users, eq(userApplications.userId, users.id))
      .innerJoin(applications, eq(userApplications.appId, applications.id))
      .where(eq(userApplications.appId, appId));
    return result;
  }

  async getAllUserApplications(): Promise<Array<UserApplication & { username: string; email: string; appName: string }>> {
    const result = await db
      .select({
        id: userApplications.id,
        userId: userApplications.userId,
        appId: userApplications.appId,
        username: users.username,
        email: users.email,
        appName: applications.appName,
        createdAt: userApplications.createdAt,
        updatedAt: userApplications.updatedAt,
      })
      .from(userApplications)
      .innerJoin(users, eq(userApplications.userId, users.id))
      .innerJoin(applications, eq(userApplications.appId, applications.id));
    return result;
  }

  async assignUserToApp(appId: number, userId: number): Promise<UserApplication | null> {
    // Check if assignment already exists
    const existing = await db
      .select()
      .from(userApplications)
      .where(and(eq(userApplications.appId, appId), eq(userApplications.userId, userId)))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const result = await db
      .insert(userApplications)
      .values({ appId, userId })
      .returning();
    return result[0] || null;
  }

  async removeUserFromApp(appId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(userApplications)
      .where(and(eq(userApplications.appId, appId), eq(userApplications.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async getUsersByAppId(appId: number): Promise<Array<{ id: number; username: string; email: string; createdAt: Date; updatedAt: Date }>> {
    const result = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(userApplications)
      .innerJoin(users, eq(userApplications.userId, users.id))
      .where(eq(userApplications.appId, appId));
    return result;
  }

  async getApplicationsByUserId(userId: number): Promise<Application[]> {
    const result = await db
      .select({
        id: applications.id,
        appName: applications.appName,
        createdAt: applications.createdAt,
        updatedAt: applications.updatedAt,
      })
      .from(userApplications)
      .innerJoin(applications, eq(userApplications.appId, applications.id))
      .where(eq(userApplications.userId, userId));
    return result;
  }

  async getUserApplicationsAndRoles(userId: number): Promise<{
    userId: number;
    applications: Array<{
      id: number;
      appName: string;
      createdAt: Date;
      updatedAt: Date;
      roles: Array<{
        id: number;
        roleName: string;
        createdAt: Date;
        updatedAt: Date;
      }>;
    }>;
  }> {
    // Get all applications for the user
    const userApps = await this.getApplicationsByUserId(userId);

    // For each application, get all roles
    const applicationsWithRoles = await Promise.all(
      userApps.map(async (app) => {
        const appRoles = await this.getRolesByAppId(app.id);
        return {
          id: app.id,
          appName: app.appName,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt,
          roles: appRoles.map((role) => ({
            id: role.id,
            roleName: role.roleName,
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
          })),
        };
      })
    );

    return {
      userId,
      applications: applicationsWithRoles,
    };
  }
}

