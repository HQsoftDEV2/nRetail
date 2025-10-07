import { axiosInstance } from '@/api/client';
import { API_ENDPOINTS } from '@/constants/api.constants';
import { 
  UserProfile, 
  UpdateUserRequest, 
  UpdateUserPasswordRequest,
  UploadAvatarRequest,
  UploadAvatarResponse,
  UserListQuery,
  UserStats,
} from '@/types/user.types';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const userApi = {
  // Get all users (admin only)
  getAll: (params?: UserListQuery) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<UserProfile>>>(
      API_ENDPOINTS.USERS.LIST, 
      { params }
    ),

  // Get user by ID
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<UserProfile>>(API_ENDPOINTS.USERS.DETAIL(id)),

  // Update user
  update: (id: string, data: UpdateUserRequest) =>
    axiosInstance.patch<ApiResponse<UserProfile>>(API_ENDPOINTS.USERS.UPDATE(id), data),

  // Delete user
  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<{ message: string }>>(API_ENDPOINTS.USERS.DELETE(id)),

  // Get current user profile
  getProfile: () =>
    axiosInstance.get<ApiResponse<UserProfile>>(API_ENDPOINTS.USERS.PROFILE),

  // Update current user profile
  updateProfile: (data: UpdateUserRequest) =>
    axiosInstance.patch<ApiResponse<UserProfile>>(API_ENDPOINTS.USERS.PROFILE, data),

  // Update user password
  updatePassword: (data: UpdateUserPasswordRequest) =>
    axiosInstance.patch<ApiResponse<{ message: string }>>('/users/password', data),

  // Upload avatar
  uploadAvatar: (data: UploadAvatarRequest) => {
    const formData = new FormData();
    formData.append('avatar', data.file);
    
    return axiosInstance.post<ApiResponse<UploadAvatarResponse>>(
      API_ENDPOINTS.USERS.UPLOAD_AVATAR,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  // Delete avatar
  deleteAvatar: () =>
    axiosInstance.delete<ApiResponse<{ message: string }>>('/users/avatar'),

  // Get user statistics (admin only)
  getStats: () =>
    axiosInstance.get<ApiResponse<UserStats>>('/users/stats'),

  // Bulk operations (admin only)
  bulkDelete: (userIds: string[]) =>
    axiosInstance.post<ApiResponse<{ message: string; deletedCount: number }>>(
      '/users/bulk-delete',
      { userIds }
    ),

  bulkUpdateRole: (userIds: string[], role: string) =>
    axiosInstance.patch<ApiResponse<{ message: string; updatedCount: number }>>(
      '/users/bulk-update-role',
      { userIds, role }
    ),

  // Search users
  search: (query: string, params?: Omit<UserListQuery, 'search'>) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<UserProfile>>>(
      '/users/search',
      { params: { search: query, ...params } }
    ),

  // Export users (admin only)
  export: (format: 'csv' | 'excel' = 'csv') =>
    axiosInstance.get(`/users/export?format=${format}`, {
      responseType: 'blob',
    }),
};
