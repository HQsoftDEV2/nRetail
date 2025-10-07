// Common Types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// File Upload
export interface FileUpload {
  file: File;
  progress?: number;
  error?: string;
}

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  createdAt: string;
}

// Search and Filter
export interface SearchParams {
  query?: string;
  filters?: Record<string, unknown>;
  pagination?: PaginationParams;
}

export interface FilterOption {
  label: string;
  value: string | number;
  count?: number;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Form States
export interface FormState<T = unknown> extends LoadingState {
  data: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isDirty: boolean;
}

// Select Options
export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  group?: string;
}

// Breadcrumb
export interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}

// Modal/Dialog
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Toast/Notification
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Theme
export type Theme = 'light' | 'dark' | 'system';

// Language
export interface Language {
  code: string;
  name: string;
  flag: string;
}

// Date Range
export interface DateRange {
  start: Date;
  end: Date;
}

// Status
export interface Status {
  id: string;
  name: string;
  color: string;
  description?: string;
}

// Generic CRUD Operations
export interface CrudOperations<T> {
  create: (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<T>;
  read: (id: string) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
  list: (params?: PaginationParams) => Promise<{ data: T[]; meta: PaginationMeta }>;
}
