// Environment configuration for the Flashback app
// Update these values according to your backend setup

export const ENVIRONMENT = {
  // API Configuration
  API_BASE_URL: 'https://flashback.inc:9000/api/mobile',
  
  // Authentication
  REFRESH_TOKEN: 'my-token-example', // Replace with actual token provided by hackathon organizers
  
  // Development Settings
  USE_MOCK_API: false, // Always false for production
  
  // App Configuration
  APP_NAME: 'Flashback',
  APP_VERSION: '1.0.0',
  
  // Feature Flags
  ENABLE_LIVENESS_CHECK: true,
  ENABLE_SELFIE_UPLOAD: true,
  ENABLE_DEV_SKIP_OPTIONS: false, // Always false for production
  
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
  
  // Liveness Detection Configuration
  LIVENESS: {
    MIN_BLINK_COUNT: 3,
    MIN_FACE_DETECTION_RATE: 0.8, // 80%
    MAX_CONSECUTIVE_NO_FACE_FRAMES: 3,
    FRAME_PROCESSING_INTERVAL: 200, // ms - optimized for React Native camera analysis
    CHECK_DURATION: 8000, // ms
  },
};

// Production overrides - no development options
console.log('[ENV] Production mode enabled');
console.log('[ENV] API Base URL:', ENVIRONMENT.API_BASE_URL);
console.log('[ENV] Refresh Token:', ENVIRONMENT.REFRESH_TOKEN ? 'Present' : 'Missing');
console.log('[ENV] Mock API: Disabled');
console.log('[ENV] Dev Skip Options: Disabled');

// Check if we can reach the API
import('@/services/api').then(({ testApiConnection }) => {
  testApiConnection().then(isConnected => {
    if (isConnected) {
      console.log('[ENV] ✅ API connection test successful');
    } else {
      console.log('[ENV] ❌ API connection test failed - server may be unreachable');
      console.log('[ENV] 💡 Please check server status and network connectivity');
    }
  }).catch(error => {
    console.log('[ENV] ❌ API connection test error:', error.message);
  });
}).catch(error => {
  console.log('[ENV] Could not import API service for connection test');
});

export default ENVIRONMENT;
