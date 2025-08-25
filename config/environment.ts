import {
  ANIMATION_DURATION,
  API_BASE_URL,
  APP_NAME,
  APP_VERSION,
  CHECK_DURATION,
  COMPRESSION_QUALITY,
  DEBOUNCE_DELAY,
  ENABLE_DEV_SKIP_OPTIONS,
  ENABLE_LIVENESS_CHECK,
  ENABLE_SELFIE_UPLOAD,
  FRAME_PROCESSING_INTERVAL,
  LIVENESS_CHECK_DURATION,
  MAX_CONSECUTIVE_NO_FACE_FRAMES,
  MAX_FILE_SIZE,
  MIN_BLINK_COUNT,
  MIN_FACE_DETECTION_RATE,
  OTP_LENGTH,
  OTP_TIMEOUT,
  PHONE_REGEX,
  REFRESH_TOKEN,
  UPLOAD_TIMEOUT,
  USE_MOCK_API,
} from '@env';

// Environment configuration for the Flashback app
// Values are now loaded from .env file

export const ENVIRONMENT = {
  // API Configuration
  API_BASE_URL: API_BASE_URL || 'https://flashback.inc:9000/api/mobile',
  
  // Authentication
  REFRESH_TOKEN: REFRESH_TOKEN || 'my-token-example',
  
  // Development Settings
  USE_MOCK_API: USE_MOCK_API === 'true',
  
  // App Configuration
  APP_NAME: APP_NAME || 'Flashback',
  APP_VERSION: APP_VERSION || '1.0.0',
  
  // Feature Flags
  ENABLE_LIVENESS_CHECK: ENABLE_LIVENESS_CHECK === 'true',
  ENABLE_SELFIE_UPLOAD: ENABLE_SELFIE_UPLOAD === 'true',
  ENABLE_DEV_SKIP_OPTIONS: ENABLE_DEV_SKIP_OPTIONS === 'true',
  
  // Timeouts
  OTP_TIMEOUT: parseInt(OTP_TIMEOUT) || 30000,
  LIVENESS_CHECK_DURATION: parseInt(LIVENESS_CHECK_DURATION) || 8000,
  UPLOAD_TIMEOUT: parseInt(UPLOAD_TIMEOUT) || 60000,
  
  // Validation
  PHONE_REGEX: new RegExp(PHONE_REGEX || '^\\+91[6-9]\\d{9}$'),
  OTP_LENGTH: parseInt(OTP_LENGTH) || 6,
  
  // UI Configuration
  ANIMATION_DURATION: parseInt(ANIMATION_DURATION) || 300,
  DEBOUNCE_DELAY: parseInt(DEBOUNCE_DELAY) || 500,
  
  // API Endpoints
  ENDPOINTS: {
    SEND_OTP: '/sendOTP',
    VERIFY_OTP: '/verifyOTP',
    UPLOAD_SELFIE: '/uploadUserPortrait',
  },
  
  // File Upload Configuration
  UPLOAD: {
    MAX_FILE_SIZE: parseInt(MAX_FILE_SIZE) || 10 * 1024 * 1024,
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
    COMPRESSION_QUALITY: parseFloat(COMPRESSION_QUALITY) || 0.8,
  },
  
  // Liveness Detection Configuration
  LIVENESS: {
    MIN_BLINK_COUNT: parseInt(MIN_BLINK_COUNT) || 3,
    MIN_FACE_DETECTION_RATE: parseFloat(MIN_FACE_DETECTION_RATE) || 0.8,
    MAX_CONSECUTIVE_NO_FACE_FRAMES: parseInt(MAX_CONSECUTIVE_NO_FACE_FRAMES) || 3,
    FRAME_PROCESSING_INTERVAL: parseInt(FRAME_PROCESSING_INTERVAL) || 200,
    CHECK_DURATION: parseInt(CHECK_DURATION) || 8000,
  },
};

// Production overrides - no development options
console.log('[ENV] Environment loaded from .env file');
console.log('[ENV] API Base URL:', ENVIRONMENT.API_BASE_URL);
console.log('[ENV] Refresh Token:', ENVIRONMENT.REFRESH_TOKEN ? 'Present' : 'Missing');
console.log('[ENV] Mock API:', ENVIRONMENT.USE_MOCK_API ? 'Enabled' : 'Disabled');
console.log('[ENV] Dev Skip Options:', ENVIRONMENT.ENABLE_DEV_SKIP_OPTIONS ? 'Enabled' : 'Disabled');

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
