export interface ClaimConfig {
  Username: boolean;
  Email: boolean;
  UserId: boolean;
  tokenExpiry: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  sub?: number;
  username?: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export interface RegisterBody {
  username: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginBody {
  email: string;
  phone: string;
  password: string;
}

export interface DecodeBody {
  token: string;
}

export interface UpdateClaimConfigBody {
  Username?: boolean;
  Email?: boolean;
  UserId?: boolean;
  tokenExpiry?: string;
}

export interface UpdateUserBody {
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export interface CreateRoleBody {
  roleName: string;
}

export interface UpdateRoleBody {
  roleName?: string;
}

export interface CreateApplicationBody {
  appName: string;
}

export interface UpdateApplicationBody {
  appName?: string;
}

export interface AssignRoleToAppBody {
  roleId: number;
}

export interface AppRoleAssignment {
  id: number;
  appId: number;
  roleId: number;
  roleName: string;
  appName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignUserToAppBody {
  userId: number;
}

export interface UserApplicationAssignment {
  id: number;
  userId: number;
  appId: number;
  username: string;
  email: string;
  appName: string;
  createdAt: Date;
  updatedAt: Date;
}

