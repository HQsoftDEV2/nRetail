import { useState, useCallback } from "react";
import { useMutation } from "@/api/hooks/useMutation";
import { API_ENDPOINTS } from "@/constants/api.constants";
import { axiosInstance } from "@/api/client";
import {
  LoginRequest,
  RegisterRequest,
  User,
  AuthState,
} from "@/types/auth.types";
import { logger } from "@/services/logger.service";

// Auth state management
let authState: AuthState = {
  isAuthenticated: false,
  user: null,
  tokens: null,
  loading: false,
  error: null,
};

// Auth state listeners
const authListeners: Array<(state: AuthState) => void> = [];

const notifyListeners = () => {
  authListeners.forEach((listener) => listener(authState));
};

const updateAuthState = (updates: Partial<AuthState>) => {
  authState = { ...authState, ...updates };
  notifyListeners();
};

export const useAuth = () => {
  const [state, setState] = useState<AuthState>(authState);

  // Subscribe to auth state changes
  useState(() => {
    const listener = (newState: AuthState) => setState(newState);
    authListeners.push(listener);

    return () => {
      const index = authListeners.indexOf(listener);
      if (index > -1) {
        authListeners.splice(index, 1);
      }
    };
  });

  // Mutations: use HTTP layer (MSW will mock these endpoints in dev)
  const loginMutation = useMutation({
    onSuccess: (data: any) => {
      const { user, accessToken, refreshToken, expiresIn } = data.data;

      updateAuthState({
        isAuthenticated: true,
        user,
        tokens: { accessToken, refreshToken, expiresIn },
        loading: false,
        error: null,
      });

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      logger.info("User logged in successfully", { userId: user.id });
    },
    onError: (error: any) => {
      updateAuthState({
        loading: false,
        error: error?.response?.data?.message || "Login failed",
      });

      logger.error("Login failed", error);
    },
  });

  const registerMutation = useMutation({
    onSuccess: (data: any) => {
      const { user, accessToken, refreshToken, expiresIn } = data.data;

      updateAuthState({
        isAuthenticated: true,
        user,
        tokens: { accessToken, refreshToken, expiresIn },
        loading: false,
        error: null,
      });

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      logger.info("User registered successfully", { userId: user.id });
    },
    onError: (error: any) => {
      updateAuthState({
        loading: false,
        error: error?.response?.data?.message || "Registration failed",
      });

      logger.error("Registration failed", error);
    },
  });

  // Login function
  const login = useCallback(
    async (credentials: LoginRequest) => {
      updateAuthState({ loading: true, error: null });
      try {
        await loginMutation.mutate(() => ({
          method: "POST",
          url: API_ENDPOINTS.AUTH.LOGIN,
          data: credentials,
        }));
      } catch {
        // onError handled in mutation; ensure loading flag cleared if needed
        updateAuthState({ loading: false });
      }
    },
    [loginMutation]
  );

  // Register function
  const register = useCallback(
    async (data: RegisterRequest) => {
      updateAuthState({ loading: true, error: null });
      try {
        await registerMutation.mutate(() => ({
          method: "POST",
          url: API_ENDPOINTS.AUTH.REGISTER,
          data,
        }));
      } catch {
        updateAuthState({ loading: false });
      }
    },
    [registerMutation]
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      logger.error("Logout API call failed", error);
    } finally {
      // Clear auth state
      updateAuthState({
        isAuthenticated: false,
        user: null,
        tokens: null,
        loading: false,
        error: null,
      });

      // Clear tokens from localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      logger.info("User logged out");
    }
  }, []);

  // Check if user is authenticated on mount
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      updateAuthState({ loading: false });
      return;
    }

    updateAuthState({ loading: true });

    try {
      const response = await axiosInstance.get('/auth/profile');
      const user = response.data.data;

      updateAuthState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
      });
    } catch (error) {
      // Token is invalid, clear auth state
      updateAuthState({
        isAuthenticated: false,
        user: null,
        tokens: null,
        loading: false,
        error: null,
      });

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    updateAuthState({ error: null });
  }, []);

  return {
    // State
    ...state,

    // Actions
    login,
    register,
    logout,
    checkAuth,
    clearError,
  };
};
