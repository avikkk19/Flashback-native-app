// Environment configuration for the Flashback app
// Update these values according to your backend setup

export const ENVIRONMENT = {
  // API Configuration
  API_BASE_URL: 'https://flashback.inc:9000/api/mobile',
  
  // Authentication
  REFRESH_TOKEN: 'my-token-example', // Replace with actual token provided by hackathon organizers
  
  // Development Settings
  USE_MOCK_API: false, // Set to false to use real API
  
  // App Configuration
  APP_NAME: 'Flashback',
  APP_VERSION: '1.0.0',
  
  // Feature Flags
  ENABLE_LIVENESS_CHECK: true,
  ENABLE_SELFIE_UPLOAD: true,
  ENABLE_DEV_SKIP_OPTIONS: false, // Set to false in production
  
  // Timeouts
  OTP_TIMEOUT: 30000, // 30 seconds
  LIVENESS_CHECK_DURATION: 8000, // 8 seconds
  UPLOAD_TIMEOUT: 60000, // 60 seconds
  
  // Validation
  PHONE_REGEX: /^\+91[6-9]\d{9}$/, // Indian phone numbers
  OTP_LENGTH: 6,
  
  // UI Configuration
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  
  // API Endpoints
  ENDPOINTS: {
    SEND_OTP: '/sendOTP',
    VERIFY_OTP: '/verifyOTP',
    UPLOAD_SELFIE: '/uploadUserPortrait',
  },
  
  // File Upload Configuration
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
    COMPRESSION_QUALITY: 0.8,
  },
};

// Development overrides
if (__DEV__) {
  ENVIRONMENT.ENABLE_DEV_SKIP_OPTIONS = false; // Disable skip options in production
  ENVIRONMENT.USE_MOCK_API = false; // Use real API
  
  // For development, you can override the API URL here
  // ENVIRONMENT.API_BASE_URL = 'http://localhost:9000/api/mobile';
  
  // Enable more verbose logging in development
  console.log('[ENV] Development mode enabled');
  console.log('[ENV] API Base URL:', ENVIRONMENT.API_BASE_URL);
  console.log('[ENV] Refresh Token:', ENVIRONMENT.REFRESH_TOKEN ? 'Present' : 'Missing');
}

export default ENVIRONMENT;
