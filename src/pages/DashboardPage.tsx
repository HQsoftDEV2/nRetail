import React, { useEffect } from "react";
import { Page, Box, Text, Button, Icon } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/services/logger.service";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      logger.info("User logged out from dashboard");
    } catch (error) {
      logger.error("Logout failed", error);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Box className="text-center">
          <Text.Title>Please log in to access the dashboard</Text.Title>
        </Box>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Box className="p-4 space-y-6">
        {/* Header */}
        <Box className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <Box className="flex items-center justify-between">
            <Box>
              <Text.Title
                size="large"
                className="text-gray-900 dark:text-white"
              >
                Welcome, {user.name}!
              </Text.Title>
              <Text size="large" className="text-gray-600 dark:text-gray-400">
                {user.email}
              </Text>
            </Box>
            <Box className="flex space-x-2">
              <Button
                variant="secondary"
                size="small"
                onClick={() => navigate("/")}
                className="text-blue-600 hover:text-blue-700"
              >
                <Icon icon="zi-home" className="mr-1" />
                Home
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700"
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Box>

        {/* User Info Card */}
        <Box className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <Text.Title
            size="large"
            className="text-gray-900 dark:text-white mb-4"
          >
            Profile Information
          </Text.Title>

          <Box className="space-y-3">
            <Box className="flex items-center space-x-3">
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <Box>
                <Text
                  size="large"
                  className="font-medium text-gray-900 dark:text-white"
                >
                  {user.name}
                </Text>
                <Text size="small" className="text-gray-600 dark:text-gray-400">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Text>
              </Box>
            </Box>

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <Box>
                <Text size="small" className="text-gray-500 dark:text-gray-400">
                  Email Status
                </Text>
                <Text
                  size="large"
                  className={
                    user.isEmailVerified ? "text-green-600" : "text-yellow-600"
                  }
                >
                  {user.isEmailVerified ? "Verified" : "Pending Verification"}
                </Text>
              </Box>

              <Box>
                <Text size="small" className="text-gray-500 dark:text-gray-400">
                  Member Since
                </Text>
                <Text size="large" className="text-gray-900 dark:text-white">
                  {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Quick Actions */}
        <Box className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <Text.Title
            size="large"
            className="text-gray-900 dark:text-white mb-4"
          >
            Quick Actions
          </Text.Title>

          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="primary"
              size="large"
              fullWidth
              className="justify-start"
            >
              <Icon icon="zi-user" className="mr-2" />
              Edit Profile
            </Button>

            <Button
              variant="secondary"
              size="large"
              fullWidth
              className="justify-start"
            >
              <Icon icon="zi-lock" className="mr-2" />
              Change Password
            </Button>

            <Button
              variant="secondary"
              size="large"
              fullWidth
              className="justify-start"
            >
              <Icon icon="zi-setting" className="mr-2" />
              Settings
            </Button>

            <Button
              variant="secondary"
              size="large"
              fullWidth
              className="justify-start"
            >
              <Icon icon="zi-user" className="mr-2" />
              Help & Support
            </Button>
          </Box>
        </Box>

        {/* API Demo */}
        <Box className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <Text.Title
            size="large"
            className="text-gray-900 dark:text-white mb-4"
          >
            API Integration Demo
          </Text.Title>

          <Text size="small" className="text-gray-600 dark:text-gray-400 mb-4">
            This dashboard demonstrates successful authentication and API
            integration using mock data. The login process simulates real API
            calls with proper error handling and loading states.
          </Text>

          <Box className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
            <Text size="small" className="text-green-800 dark:text-green-200">
              ✅ Authentication successful
              <br />
              ✅ User data loaded
              <br />
              ✅ Mock API integration working
              <br />
              ✅ Error handling implemented
              <br />✅ Loading states managed
            </Text>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default DashboardPage;
