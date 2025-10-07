// Application Configuration
export const appConfig = {
  // App Info
  name: import.meta.env.VITE_APP_NAME || 'My Large Scale App',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.VITE_NODE_ENV || 'development',
  
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(import.meta.env.VITE_API_RETRY_DELAY || '1000'),
  },
  
  // Feature Flags
  features: {
    enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableLogging: import.meta.env.VITE_ENABLE_LOGGING !== 'false',
    enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  },
  
  // Third-party Services
  services: {
    googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
    sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'INFO',
  },
  
  // Storage Configuration
  storage: {
    tokenKey: import.meta.env.VITE_TOKEN_STORAGE_KEY || 'accessToken',
    refreshTokenKey: import.meta.env.VITE_REFRESH_TOKEN_STORAGE_KEY || 'refreshToken',
  },
  
  // Security
  security: {
    enableCsrf: import.meta.env.VITE_ENABLE_CSRF !== 'false',
    csrfTokenName: import.meta.env.VITE_CSRF_TOKEN_NAME || 'csrf-token',
  },
} as const;

// Type for the configuration
export type AppConfig = typeof appConfig;

// Helper function to check if we're in development
export const isDevelopment = appConfig.environment === 'development';

// Helper function to check if we're in production
export const isProduction = appConfig.environment === 'production';

// Helper function to get API base URL
export const getApiBaseUrl = () => appConfig.api.baseUrl;

// Helper function to check if feature is enabled
export const isFeatureEnabled = (feature: keyof typeof appConfig.features) => 
  appConfig.features[feature];
