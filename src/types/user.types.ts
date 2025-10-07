import { User, UserRole } from './auth.types';

// User Profile
export interface UserProfile extends User {
  phone?: string;
  address?: UserAddress;
  preferences: UserPreferences;
  lastLoginAt?: string;
}

export interface UserAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  theme: 'light' | 'dark' | 'system';
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
}

// User Update Types
export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  address?: Partial<UserAddress>;
  preferences?: Partial<UserPreferences>;
}

export interface UpdateUserPasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UploadAvatarRequest {
  file: File;
}

export interface UploadAvatarResponse {
  avatar: string;
  message: string;
}

// User Query Types
export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  sortBy?: 'name' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// User Statistics
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: Record<UserRole, number>;
}
