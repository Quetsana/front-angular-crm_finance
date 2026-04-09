export type UserRole = 'admin' | 'manager' | 'accountant' | 'viewer';
export type UserStatus = 'active' | 'inactive';
export type ThemePreference = 'light' | 'dark' | 'system';
export type LanguagePreference = 'en' | 'es';

export interface ModulePermissions {
  dashboard:    { view: boolean };
  transactions: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  accounts:     { view: boolean; create: boolean; edit: boolean; delete: boolean };
  aiAnalysis:   { view: boolean; generate: boolean };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  avatarInitials: string;
  avatarColor: string;
  permissions: ModulePermissions;
  preferences: {
    language: LanguagePreference;
    theme: ThemePreference;
    emailNotifications: boolean;
    pushNotifications: boolean;
    timezone: string;
  };
  createdAt: string;
  lastLogin: string;
}

export const DEFAULT_PERMISSIONS: Record<UserRole, ModulePermissions> = {
  admin: {
    dashboard:    { view: true },
    transactions: { view: true, create: true, edit: true, delete: true },
    accounts:     { view: true, create: true, edit: true, delete: true },
    aiAnalysis:   { view: true, generate: true }
  },
  manager: {
    dashboard:    { view: true },
    transactions: { view: true, create: true, edit: true, delete: false },
    accounts:     { view: true, create: false, edit: false, delete: false },
    aiAnalysis:   { view: true, generate: true }
  },
  accountant: {
    dashboard:    { view: true },
    transactions: { view: true, create: true, edit: true, delete: false },
    accounts:     { view: false, create: false, edit: false, delete: false },
    aiAnalysis:   { view: true, generate: false }
  },
  viewer: {
    dashboard:    { view: true },
    transactions: { view: true, create: false, edit: false, delete: false },
    accounts:     { view: false, create: false, edit: false, delete: false },
    aiAnalysis:   { view: true, generate: false }
  }
};
