import { axiosInstance } from '@/api/client';
import { API_ENDPOINTS } from '@/constants/api.constants';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyEmailRequest,
  RefreshTokenResponse,
} from '@/types/auth.types';
import { ApiResponse } from '@/types/api.types';

export const authApi = {
  // Login
  login: (data: LoginRequest) => 
    axiosInstance.post<ApiResponse<LoginResponse>>(API_ENDPOINTS.AUTH.LOGIN, data),

  // Register
  register: (data: RegisterRequest) =>
    axiosInstance.post<ApiResponse<RegisterResponse>>(API_ENDPOINTS.AUTH.REGISTER, data),

  // Logout
  logout: () => 
    axiosInstance.post<ApiResponse<{ message: string }>>(API_ENDPOINTS.AUTH.LOGOUT),

  // Refresh Token
  refresh: (refreshToken: string) =>
    axiosInstance.post<ApiResponse<RefreshTokenResponse>>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken }),

  // Forgot Password
  forgotPassword: (data: ForgotPasswordRequest) =>
    axiosInstance.post<ApiResponse<{ message: string }>>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data),

  // Reset Password
  resetPassword: (data: ResetPasswordRequest) =>
    axiosInstance.post<ApiResponse<{ message: string }>>(API_ENDPOINTS.AUTH.RESET_PASSWORD, data),

  // Verify Email
  verifyEmail: (data: VerifyEmailRequest) =>
    axiosInstance.post<ApiResponse<{ message: string }>>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data),

  // Resend Verification Email
  resendVerification: (email: string) =>
    axiosInstance.post<ApiResponse<{ message: string }>>(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { email }),

  // Change Password (authenticated endpoint)
  changePassword: (data: ChangePasswordRequest) =>
    axiosInstance.patch<ApiResponse<{ message: string }>>('/auth/change-password', data),

  // Get Current User Profile (authenticated endpoint)
  getProfile: () =>
    axiosInstance.get<ApiResponse<any>>('/auth/profile'),
};
