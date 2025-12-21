import { pgTable, serial, varchar, timestamp, boolean, integer, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const claimConfig = pgTable('claim_config', {
  id: serial('id').primaryKey(),
  includeUsername: boolean('include_username').default(true).notNull(),
  includeEmail: boolean('include_email').default(true).notNull(),
  includeUserId: boolean('include_user_id').default(true).notNull(),
  tokenExpiry: varchar('token_expiry', { length: 50 }).default('24h').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  roleName: varchar('role_name', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const applications = pgTable('applications', {
  id: serial('id').primaryKey(),
  appName: varchar('app_name', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const appRoles = pgTable('app_roles', {
  id: serial('id').primaryKey(),
  appId: integer('app_id').notNull().references(() => applications.id, { onDelete: 'cascade' }),
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueAppRole: unique().on(table.appId, table.roleId),
}));

export const userApplications = pgTable('user_applications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  appId: integer('app_id').notNull().references(() => applications.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueUserApp: unique().on(table.userId, table.appId),
}));

// Relations
export const rolesRelations = relations(roles, ({ many }) => ({
  appRoles: many(appRoles),
}));

export const applicationsRelations = relations(applications, ({ many }) => ({
  appRoles: many(appRoles),
  userApplications: many(userApplications),
}));

export const usersRelations = relations(users, ({ many }) => ({
  userApplications: many(userApplications),
}));

export const appRolesRelations = relations(appRoles, ({ one }) => ({
  application: one(applications, {
    fields: [appRoles.appId],
    references: [applications.id],
  }),
  role: one(roles, {
    fields: [appRoles.roleId],
    references: [roles.id],
  }),
}));

export const userApplicationsRelations = relations(userApplications, ({ one }) => ({
  user: one(users, {
    fields: [userApplications.userId],
    references: [users.id],
  }),
  application: one(applications, {
    fields: [userApplications.appId],
    references: [applications.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ClaimConfig = typeof claimConfig.$inferSelect;
export type NewClaimConfig = typeof claimConfig.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type AppRole = typeof appRoles.$inferSelect;
export type NewAppRole = typeof appRoles.$inferInsert;
export type UserApplication = typeof userApplications.$inferSelect;
export type NewUserApplication = typeof userApplications.$inferInsert;

