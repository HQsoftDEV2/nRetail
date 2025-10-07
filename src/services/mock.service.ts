import {
  User,
  UserRole,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/types/auth.types";
import { ApiResponse } from "@/types/api.types";

// Mock users database
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    name: "Admin User",
    avatar: "https://via.placeholder.com/150/007bff/ffffff?text=A",
    role: UserRole.ADMIN,
    isEmailVerified: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    email: "user@example.com",
    name: "Regular User",
    avatar: "https://via.placeholder.com/150/28a745/ffffff?text=U",
    role: UserRole.USER,
    isEmailVerified: true,
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  },
  {
    id: "3",
    email: "moderator@example.com",
    name: "Moderator User",
    avatar: "https://via.placeholder.com/150/ffc107/ffffff?text=M",
    role: UserRole.MODERATOR,
    isEmailVerified: false,
    createdAt: "2024-01-03T00:00:00.000Z",
    updatedAt: "2024-01-03T00:00:00.000Z",
  },
];

// Mock passwords (in real app, these would be hashed)
const mockPasswords: Record<string, string> = {
  "admin@example.com": "admin123",
  "user@example.com": "user123",
  "moderator@example.com": "moderator123",
};

// Generate mock JWT tokens
const generateMockToken = (
  userId: string,
  type: "access" | "refresh"
): string => {
  const payload = {
    sub: userId,
    type,
    iat: Math.floor(Date.now() / 1000),
    exp:
      Math.floor(Date.now() / 1000) +
      (type === "access" ? 3600 : 7 * 24 * 3600), // 1 hour for access, 7 days for refresh
  };

  // Simple base64 encoding for mock (in real app, use proper JWT library)
  return btoa(JSON.stringify(payload));
};

// Simulate network delay
const simulateDelay = (min = 500, max = 1500): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// Mock API responses
export const mockAuthService = {
  // Login
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    await simulateDelay();

    const user = mockUsers.find((u) => u.email === data.email);

    if (!user) {
      throw {
        response: {
          status: 401,
          data: {
            message: "Invalid email or password",
            errors: { credentials: ["Invalid email or password"] },
            statusCode: 401,
            timestamp: new Date().toISOString(),
            path: "/auth/login",
          },
        },
      };
    }

    if (mockPasswords[data.email] !== data.password) {
      throw {
        response: {
          status: 401,
          data: {
            message: "Invalid email or password",
            errors: { credentials: ["Invalid email or password"] },
            statusCode: 401,
            timestamp: new Date().toISOString(),
            path: "/auth/login",
          },
        },
      };
    }

    const accessToken = generateMockToken(user.id, "access");
    const refreshToken = generateMockToken(user.id, "refresh");

    return {
      data: {
        user,
        accessToken,
        refreshToken,
        expiresIn: 3600, // 1 hour
      },
      message: "Login successful",
      success: true,
      timestamp: new Date().toISOString(),
    };
  },

  // Register
  register: async (
    data: RegisterRequest
  ): Promise<ApiResponse<RegisterResponse>> => {
    await simulateDelay();

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === data.email);
    if (existingUser) {
      throw {
        response: {
          status: 409,
          data: {
            message: "User already exists",
            errors: { email: ["User with this email already exists"] },
            statusCode: 409,
            timestamp: new Date().toISOString(),
            path: "/auth/register",
          },
        },
      };
    }

    // Validate password confirmation
    if (data.password !== data.confirmPassword) {
      throw {
        response: {
          status: 400,
          data: {
            message: "Passwords do not match",
            errors: { confirmPassword: ["Passwords do not match"] },
            statusCode: 400,
            timestamp: new Date().toISOString(),
            path: "/auth/register",
          },
        },
      };
    }

    // Create new user
    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      email: data.email,
      name: data.name,
      role: UserRole.USER,
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);
    mockPasswords[data.email] = data.password;

    const accessToken = generateMockToken(newUser.id, "access");
    const refreshToken = generateMockToken(newUser.id, "refresh");

    return {
      data: {
        user: newUser,
        accessToken,
        refreshToken,
        expiresIn: 3600,
        message: "Registration successful. Please verify your email.",
      },
      message: "Registration successful",
      success: true,
      timestamp: new Date().toISOString(),
    };
  },

  // Get user profile
  getProfile: async (token: string): Promise<ApiResponse<User>> => {
    await simulateDelay();

    try {
      // Decode token (simplified for mock)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const user = mockUsers.find((u) => u.id === payload.sub);

      if (!user) {
        throw new Error("User not found");
      }

      return {
        data: user,
        message: "Profile retrieved successfully",
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw {
        response: {
          status: 401,
          data: {
            message: "Invalid or expired token",
            statusCode: 401,
            timestamp: new Date().toISOString(),
            path: "/auth/profile",
          },
        },
      };
    }
  },

  // Logout
  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    await simulateDelay();

    return {
      data: { message: "Logout successful" },
      message: "Logout successful",
      success: true,
      timestamp: new Date().toISOString(),
    };
  },

  // Refresh token
  refresh: async (
    refreshToken: string
  ): Promise<
    ApiResponse<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    }>
  > => {
    await simulateDelay();

    try {
      const payload = JSON.parse(atob(refreshToken.split(".")[1]));
      const user = mockUsers.find((u) => u.id === payload.sub);

      if (!user) {
        throw new Error("User not found");
      }

      const newAccessToken = generateMockToken(user.id, "access");
      const newRefreshToken = generateMockToken(user.id, "refresh");

      return {
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: 3600,
        },
        message: "Token refreshed successfully",
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw {
        response: {
          status: 401,
          data: {
            message: "Invalid or expired refresh token",
            statusCode: 401,
            timestamp: new Date().toISOString(),
            path: "/auth/refresh",
          },
        },
      };
    }
  },
};

// Demo credentials for easy testing
export const DEMO_CREDENTIALS = {
  admin: { email: "admin@example.com", password: "admin123" },
  user: { email: "user@example.com", password: "user123" },
  moderator: { email: "moderator@example.com", password: "moderator123" },
} as const;
