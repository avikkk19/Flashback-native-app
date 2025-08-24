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
  LIVENESS_CHECK_DURATION: 5000, // 5 seconds
  UPLOAD_TIMEOUT: 60000, // 60 seconds
  
  // Validation
  PHONE_REGEX: /^\+91[6-9]\d{9}$/, // Indian phone numbers
  OTP_LENGTH: 6,
  
  // UI Configuration
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
};

// Development overrides
if (__DEV__) {
  ENVIRONMENT.ENABLE_DEV_SKIP_OPTIONS = false; // Disable skip options in production
  ENVIRONMENT.USE_MOCK_API = false; // Use real API
  ENVIRONMENT.API_BASE_URL = 'https://flashback.inc:9000/api/mobile'; // Keep same for consistency
}

export default ENVIRONMENT;
