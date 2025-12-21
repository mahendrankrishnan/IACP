import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, claimConfig } from '../db/schema.js';
import type { User, ClaimConfig, JWTPayload } from '../types/index.js';

export class AuthService {
  async findUserByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  }

  async findUserByPhone(phone: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    return result[0] || null;
  }

  async findUserByUsername(username: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0] || null;
  }

  async findUserById(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }

  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const result = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      phone: users.phone,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users);
    return result;
  }

  async createUser(username: string, email: string, password: string, phone: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        phone,
      })
      .returning();
    return result[0];
  }

  async updateUser(
    id: number,
    updates: { username?: string; email?: string; phone?: string; password?: string }
  ): Promise<User | null> {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updates.username) {
      updateData.username = updates.username;
    }

    if (updates.email) {
      updateData.email = updates.email;
    }

    if (updates.phone) {
      updateData.phone = updates.phone;
    }

    if (updates.password) {
      updateData.password = await bcrypt.hash(updates.password, 10);
    }

    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    return result[0] || null;
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async getClaimConfig(): Promise<ClaimConfig> {
    const result = await db.select().from(claimConfig).limit(1);
    
    if (result.length === 0) {
      // Initialize default config if none exists
      const defaultConfig = await db
        .insert(claimConfig)
        .values({
          includeUsername: true,
          includeEmail: true,
          includeUserId: true,
          tokenExpiry: '24h',
        })
        .returning();
      return {
        Username: defaultConfig[0].includeUsername,
        Email: defaultConfig[0].includeEmail,
        UserId: defaultConfig[0].includeUserId,
        tokenExpiry: defaultConfig[0].tokenExpiry,
      };
    }

    return {
      Username: result[0].includeUsername,
      Email: result[0].includeEmail,
      UserId: result[0].includeUserId,
      tokenExpiry: result[0].tokenExpiry,
    };
  }

  async updateClaimConfig(config: Partial<ClaimConfig>): Promise<ClaimConfig> {
    const existing = await db.select().from(claimConfig).limit(1);
    
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (config.Username !== undefined) {
      updateData.includeUsername = config.Username;
    }
    if (config.Email !== undefined) {
      updateData.includeEmail = config.Email;
    }
    if (config.UserId !== undefined) {
      updateData.includeUserId = config.UserId;
    }
    if (config.tokenExpiry !== undefined) {
      updateData.tokenExpiry = config.tokenExpiry;
    }
    
    if (existing.length === 0) {
      const result = await db
        .insert(claimConfig)
        .values({
          includeUsername: config.Username ?? true,
          includeEmail: config.Email ?? true,
          includeUserId: config.UserId ?? true,
          tokenExpiry: config.tokenExpiry ?? '24h',
        })
        .returning();
      return {
        Username: result[0].includeUsername,
        Email: result[0].includeEmail,
        UserId: result[0].includeUserId,
        tokenExpiry: result[0].tokenExpiry,
      };
    }

    const result = await db
      .update(claimConfig)
      .set(updateData)
      .where(eq(claimConfig.id, existing[0].id))
      .returning();

    return {
      Username: result[0].includeUsername,
      Email: result[0].includeEmail,
      UserId: result[0].includeUserId,
      tokenExpiry: result[0].tokenExpiry,
    };
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  generateTokenPayload(user: User, config: ClaimConfig): JWTPayload {
    const payload: JWTPayload = {};

    if (config.UserId) {
      payload.sub = user.id;
    }

    if (config.Username) {
      payload.username = user.username;
    }

    if (config.Email) {
      payload.email = user.email;
    }

    payload.iat = Math.floor(Date.now() / 1000);

    return payload;
  }
}

