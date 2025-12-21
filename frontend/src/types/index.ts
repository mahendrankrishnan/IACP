export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ClaimConfig {
  includeUsername: boolean;
  includePhoneNumber: boolean;
  includeEmail: boolean;
  includeUserId: boolean;
  tokenExpiry: string;
}

export interface JWTPayload {
  sub?: number;
  username?: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface UserListResponse {
  users: User[];
}

export interface Role {
  id: number;
  roleName: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Application {
  id: number;
  appName: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AppRole {
  id: number;
  appId: number;
  roleId: number;
  roleName: string;
  appName: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface RoleListResponse {
  roles: Role[];
}

export interface ApplicationListResponse {
  applications: Application[];
}

export interface AppRoleListResponse {
  appRoles: AppRole[];
}

export interface UserApplication {
  id: number;
  userId: number;
  appId: number;
  username: string;
  email: string;
  appName: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface UserApplicationListResponse {
  userApplications: UserApplication[];
}

export interface UserApplicationRole {
  id: number;
  roleName: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ApplicationWithRoles {
  id: number;
  appName: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  roles: UserApplicationRole[];
}

export interface UserApplicationsAndRolesResponse {
  userId: number;
  applications: ApplicationWithRoles[];
}

