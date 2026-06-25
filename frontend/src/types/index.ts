export interface User {
  id: string;
  fullname: string;
  email: string;
  roleId: string | null;
  roleName?: string;
  status: string;
  isLocked: boolean;
  lockedUntil: string | null;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  rolePermissions?: RolePermission[];
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  permission: Permission;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Session {
  id: string;
  userId: string;
  ipAddress: string;
  device: string;
  browser: string;
  country: string;
  status: string;
  loginTime: string;
  lastActivity: string;
  user?: User;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  target: string;
  status: string;
  ipAddress: string;
  timestamp: string;
  user?: User;
  metadata?: any;
}

export interface DashboardData {
  totalUsers: number;
  activeSessions: number;
  failedLoginsToday: number;
  lockedAccounts: number;
  recentEvents: AuditLog[];
  securityScore: number;
}

export interface AnalyticsData {
  failedLoginTrend: { date: string; count: number }[];
  roleDistribution: { role: string; count: number }[];
  activeUsersByDay: { date: string; count: number }[];
  securityEvents: { date: string; count: number }[];
  topCountries: { country: string; count: number }[];
}

export interface AuthResponse {
  user: {
    id: string;
    fullname: string;
    email: string;
    roleId: string | null;
  };
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}
