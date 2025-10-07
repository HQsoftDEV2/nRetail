// Example usage of the Axios setup
// This file demonstrates how to use the API client, hooks, and services

import { authApi, userApi } from '@/api/endpoints';
import { useApi, useQuery, useMutation } from '@/api/hooks';
import { logger } from '@/services/logger.service';
import { LoginRequest, RegisterRequest } from '@/types/auth.types';
import { UpdateUserRequest } from '@/types/user.types';

// ===== EXAMPLE 1: Using API endpoints directly =====
export const directApiUsage = async () => {
  try {
    // Login user
    const loginData: LoginRequest = {
      email: 'user@example.com',
      password: 'password123',
    };
    
    const loginResponse = await authApi.login(loginData);
    console.log('Login successful:', loginResponse.data);
    
    // Get user profile
    const profileResponse = await userApi.getProfile();
    console.log('User profile:', profileResponse.data);
    
    // Update user profile
    const updateData: UpdateUserRequest = {
      name: 'Updated Name',
      phone: '+1234567890',
    };
    
    const updateResponse = await userApi.updateProfile(updateData);
    console.log('Profile updated:', updateResponse.data);
    
  } catch (error) {
    logger.error('API operation failed', error);
  }
};

// ===== EXAMPLE 2: Using useApi hook =====
export const useApiExample = () => {
  const { data, error, loading, execute, reset } = useApi({
    onSuccess: (data) => {
      logger.info('API call successful', data);
    },
    onError: (error) => {
      logger.error('API call failed', error);
    },
  });

  const fetchUserProfile = async () => {
    await execute({
      method: 'GET',
      url: '/users/profile',
    });
  };

  const updateUserProfile = async (userData: UpdateUserRequest) => {
    await execute({
      method: 'PATCH',
      url: '/users/profile',
      data: userData,
    });
  };

  return {
    data,
    error,
    loading,
    fetchUserProfile,
    updateUserProfile,
    reset,
  };
};

// ===== EXAMPLE 3: Using useQuery hook =====
export const useQueryExample = () => {
  const {
    data: users,
    error,
    loading,
    refetch,
    isStale,
  } = useQuery(
    {
      method: 'GET',
      url: '/users',
      params: { page: 1, limit: 10 },
    },
    {
      enabled: true,
      refetchOnMount: true,
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
      onSuccess: (data) => {
        logger.info('Users fetched successfully', data);
      },
      onError: (error) => {
        logger.error('Failed to fetch users', error);
      },
    }
  );

  return {
    users,
    error,
    loading,
    refetch,
    isStale,
  };
};

// ===== EXAMPLE 4: Using useMutation hook =====
export const useMutationExample = () => {
  const {
    data,
    error,
    loading,
    mutate: createUser,
    reset,
  } = useMutation({
    onSuccess: (data) => {
      logger.info('User created successfully', data);
    },
    onError: (error) => {
      logger.error('Failed to create user', error);
    },
    onSettled: () => {
      logger.info('User creation operation completed');
    },
  });

  const handleCreateUser = async (userData: RegisterRequest) => {
    try {
      await createUser({
        method: 'POST',
        url: '/users',
        data: userData,
      });
    } catch (error) {
      // Error is handled by the hook's onError callback
      console.error('User creation failed:', error);
    }
  };

  return {
    data,
    error,
    loading,
    createUser: handleCreateUser,
    reset,
  };
};

// ===== EXAMPLE 5: Custom hook combining multiple operations =====
export const useUserManagement = () => {
  // Query for users list
  const {
    data: users,
    error: usersError,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useQuery(
    {
      method: 'GET',
      url: '/users',
      params: { page: 1, limit: 20 },
    },
    {
      enabled: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  // Mutation for creating user
  const {
    data: createdUser,
    error: createError,
    loading: createLoading,
    mutate: createUser,
  } = useMutation({
    onSuccess: () => {
      refetchUsers(); // Refetch users list after successful creation
    },
  });

  // Mutation for updating user
  const {
    data: updatedUser,
    error: updateError,
    loading: updateLoading,
    mutate: updateUser,
  } = useMutation({
    onSuccess: () => {
      refetchUsers(); // Refetch users list after successful update
    },
  });

  // Mutation for deleting user
  const {
    error: deleteError,
    loading: deleteLoading,
    mutate: deleteUser,
  } = useMutation({
    onSuccess: () => {
      refetchUsers(); // Refetch users list after successful deletion
    },
  });

  return {
    // Users list
    users,
    usersError,
    usersLoading,
    refetchUsers,
    
    // Create user
    createUser: (userData: RegisterRequest) => createUser({
      method: 'POST',
      url: '/users',
      data: userData,
    }),
    createdUser,
    createError,
    createLoading,
    
    // Update user
    updateUser: (id: string, userData: UpdateUserRequest) => updateUser({
      method: 'PATCH',
      url: `/users/${id}`,
      data: userData,
    }),
    updatedUser,
    updateError,
    updateLoading,
    
    // Delete user
    deleteUser: (id: string) => deleteUser({
      method: 'DELETE',
      url: `/users/${id}`,
    }),
    deleteError,
    deleteLoading,
  };
};

// ===== EXAMPLE 6: Error handling patterns =====
export const errorHandlingExample = async () => {
  try {
    const response = await authApi.login({
      email: 'invalid@email.com',
      password: 'wrongpassword',
    });
  } catch (error: any) {
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || 'An error occurred';
      
      switch (status) {
        case 401:
          logger.error('Authentication failed', { message });
          // Redirect to login page
          break;
        case 403:
          logger.error('Access forbidden', { message });
          // Show access denied message
          break;
        case 404:
          logger.error('Resource not found', { message });
          // Show not found message
          break;
        case 500:
          logger.error('Server error', { message });
          // Show server error message
          break;
        default:
          logger.error('API error', { status, message });
      }
    } else if (error.request) {
      // Network error
      logger.error('Network error', error);
      // Show network error message
    } else {
      // Other error
      logger.error('Unexpected error', error);
    }
  }
};

// ===== EXAMPLE 7: File upload example =====
export const fileUploadExample = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await userApi.uploadAvatar({ file });
    logger.info('Avatar uploaded successfully', response.data);
    
    return response.data;
  } catch (error) {
    logger.error('Avatar upload failed', error);
    throw error;
  }
};
