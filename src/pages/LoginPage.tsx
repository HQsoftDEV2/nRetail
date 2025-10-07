import React, { useState, useEffect } from "react";
import { Page, Box, Text, Icon } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { LoginRequest } from "@/types/auth.types";
import { DEMO_CREDENTIALS } from "@/services/mock.service";
import { logger } from "@/services/logger.service";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading, error, clearError, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [formErrors, setFormErrors] = useState<Partial<LoginRequest>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const validateForm = (): boolean => {
    const errors: Partial<LoginRequest> = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    field: keyof LoginRequest,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (error) {
      clearError();
    }

    // Clear field error
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      logger.info("Login attempt", { email: formData.email });
    } catch (err) {
      logger.error("Login failed", err);
    }
  };

  const handleDemoLogin = (role: "admin" | "user" | "moderator") => {
    const credentials = DEMO_CREDENTIALS[role];
    setFormData((prev) => ({
      ...prev,
      email: credentials.email,
      password: credentials.password,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Box className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header */}
        <Box className="w-full max-w-md space-y-6">
          <Box className="text-center space-y-2">
            <Text.Title size="xLarge" className="text-gray-900 dark:text-white">
              Welcome Back
            </Text.Title>
            <Text size="large" className="text-gray-600 dark:text-gray-400">
              Sign in to your account
            </Text>
          </Box>

          {/* Login Form */}
          <Box className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(value) => handleInputChange("email", value)}
                error={formErrors.email}
                required
                disabled={loading}
              />

              {/* Password Input */}
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(value) => handleInputChange("password", value)}
                error={formErrors.password}
                required
                disabled={loading}
                helperText="Password must be at least 6 characters"
              />

              {/* Remember Me */}
              <Box className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    handleInputChange("rememberMe", e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={loading}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Remember me
                </label>
              </Box>

              {/* Error Message */}
              {error && (
                <Box className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                  <Text size="small" className="text-red-600 dark:text-red-400">
                    {error}
                  </Text>
                </Box>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                // variant="primary"
                // size="large"
                // fullWidth
                // loading={loading}
                disabled={loading}
                className="mt-6"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Demo Credentials */}
            <Box className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Text
                size="small"
                className="text-gray-600 dark:text-gray-400 text-center mb-3"
              >
                Demo Credentials
              </Text>
              <Box className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => handleDemoLogin("admin")}
                  disabled={loading}
                  className="text-xs"
                >
                  Admin: admin@example.com
                </Button>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => handleDemoLogin("user")}
                  disabled={loading}
                  className="text-xs"
                >
                  User: user@example.com
                </Button>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => handleDemoLogin("moderator")}
                  disabled={loading}
                  className="text-xs"
                >
                  Moderator: moderator@example.com
                </Button>
              </Box>
            </Box>

            {/* Forgot Password Link */}
            <Box className="text-center">
              <Text
                size="small"
                className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
              >
                Forgot your password?
              </Text>
            </Box>
          </Box>

          {/* Register Link */}
          <Box className="text-center">
            <Text size="small" className="text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Text
                size="small"
                className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
              >
                Sign up
              </Text>
            </Text>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default LoginPage;
