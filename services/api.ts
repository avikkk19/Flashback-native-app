import ENVIRONMENT from '@/config/environment';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// API Configuration
const API_BASE_URL = ENVIRONMENT.API_BASE_URL;
const REFRESH_TOKEN = ENVIRONMENT.REFRESH_TOKEN;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Handle cookies properly for web platform
  withCredentials: Platform.OS === 'web',
  timeout: 10000, // 10 second timeout
});

// Remove the default cookie header - we'll handle it per request
// if (Platform.OS !== 'web') {
//   apiClient.defaults.headers['Cookie'] = `refreshToken=${REFRESH_TOKEN}`;
// }

// Add request interceptor for better error handling
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] Response received from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('[API] Response error:', error.response?.status, error.response?.data);
    
    // Log more details for network errors
    if (error.code === 'NETWORK_ERROR') {
      console.error('[API] Network error details:', {
        message: error.message,
        code: error.code,
        config: error.config
      });
    }
    
    return Promise.reject(error);
  }
);

// Test API connection
export const testApiConnection = async (): Promise<boolean> => {
  // Rate limiting - prevent multiple rapid connection tests
  if (testApiConnection.lastTest && Date.now() - testApiConnection.lastTest < 5000) {
    console.log('[API] Connection test rate limited - using cached result');
    return testApiConnection.lastResult;
  }
  
  try {
    console.log('[API] Testing connection to:', API_BASE_URL);
    
    // Test with the working sendOTP endpoint (public, no auth required)
    const response = await axios.get(`${API_BASE_URL}/sendOTP`, { 
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('[API] Connection test successful:', response.status);
    
    // Cache the result
    testApiConnection.lastTest = Date.now();
    testApiConnection.lastResult = true;
    
    return true;
  } catch (error: any) {
    console.error('[API] Connection test failed:', error);
    
    // If sendOTP endpoint fails, try a different approach
    if (error.response?.status === 401) {
      // 401 means endpoint exists but requires auth - server is reachable
      console.log('[API] Server is reachable but endpoint requires authentication');
      
      // Cache the result
      testApiConnection.lastTest = Date.now();
      testApiConnection.lastResult = true;
      
      return true; // Consider this a successful connection
    } else if (error.response?.status === 404) {
      try {
        // Try to connect to the base URL
        const baseResponse = await axios.get(API_BASE_URL, { timeout: 5000 });
        console.log('[API] Base URL connection successful:', baseResponse.status);
        
        // Cache the result
        testApiConnection.lastTest = Date.now();
        testApiConnection.lastResult = true;
        
        return true;
      } catch (baseError: any) {
        console.error('[API] Base URL connection failed:', baseError);
        
        // Cache the result
        testApiConnection.lastTest = Date.now();
        testApiConnection.lastResult = false;
        
        return false;
      }
    }
    
    // Cache the result
    testApiConnection.lastTest = Date.now();
    testApiConnection.lastResult = false;
    
    return false;
  }
};

// Add static properties for rate limiting
testApiConnection.lastTest = 0;
testApiConnection.lastResult = false;

// Validate JWT token
export const validateToken = (token: string): boolean => {
  try {
    if (!token || token.length < 50) {
      console.log('[API] Token validation failed: Token too short');
      return false;
    }
    
    // Basic JWT structure validation
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('[API] Token validation failed: Invalid JWT structure');
      return false;
    }
    
    // Check if token might be expired (basic check)
    try {
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        console.log('[API] Token validation failed: Token expired');
        return false;
      }
      
      console.log('[API] Token validation successful');
      return true;
    } catch (parseError) {
      console.log('[API] Token validation failed: Cannot parse payload');
      return false;
    }
  } catch (error) {
    console.error('[API] Token validation error:', error);
    return false;
  }
};

// Types for API responses
export interface SendOTPResponse {
  success: boolean;
  message: string;
  otp?: string; // Some APIs return the OTP for testing
}

export interface VerifyOTPResponse {
  success: boolean;
  message?: string;
  error?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    phoneNumber: string;
    username: string;
  };
}

export interface UploadSelfieResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    s3Url?: string;
    secondaryUrl?: string;
    user_id?: string;
  };
  imageUrl?: string;
  portraitUrl?: string;
}

// API Service class
export class AuthService {
  /**
   * Send OTP to the provided phone number
   * @param phoneNumber - Phone number in E.164 format (+91XXXXXXXXXX)
   */
  static async sendOTP(phoneNumber: string): Promise<SendOTPResponse> {
    try {
      console.log(`[API] Sending OTP to ${phoneNumber}`);
      
      const response = await apiClient.post('/sendOTP', {
        phoneNumber,
      });
      
      console.log(`[API] OTP sent successfully:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error('[API] Send OTP error:', error);
      
      if (error.response?.status === 429) {
        throw new Error('Too many requests. Please wait before trying again.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid phone number format.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please check your credentials.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please check your internet connection.');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
      }
    }
  }

  /**
   * Verify OTP with the provided credentials
   * @param phoneNumber - Phone number in E.164 format
   * @param otp - 6-digit OTP code
   */
  static async verifyOTP(phoneNumber: string, otp: string): Promise<VerifyOTPResponse> {
    try {
      console.log(`[API] Verifying OTP ${otp} for ${phoneNumber}`);
      
      const response = await apiClient.post('/verifyOTP', {
        phoneNumber,
        otp,
        login_platform: 'MobileApp',
      });
      
      console.log(`[API] OTP verification response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error('[API] Verify OTP error:', error);
      
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid OTP. Please check and try again.');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid or expired OTP. Please request a new one.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many attempts. Please wait before trying again.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please check your internet connection.');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to verify OTP. Please try again.');
      }
    }
  }

  /**
   * Upload selfie image to the backend
   * @param imageUri - Local URI of the captured image
   * @param username - Username (E.164 phone number)
   * @param token - JWT token from OTP verification
   * @param onProgress - Optional progress callback
   */
  static async uploadSelfie(
    imageUri: string,
    username: string,
    token: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadSelfieResponse> {
    try {
      console.log(`[API] Uploading selfie for ${username}`);
      console.log(`[API] Image URI: ${imageUri}`);
      
      // Validate inputs
      if (!imageUri || !username || !token) {
        throw new Error('Missing required parameters for upload');
      }

      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error('Image file not found. Please capture the image again.');
      }

      console.log(`[API] File info:`, fileInfo);
      
      // Create form data
      const formData = new FormData();
      
      // Get file extension and determine MIME type
      const fileName = imageUri.split('/').pop() || 'selfie.jpg';
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
      
      console.log(`[API] File details - Name: ${fileName}, MIME: ${mimeType}, Size: ${fileInfo.size} bytes`);
      
      // Append image file with proper React Native format
      formData.append('image', {
        uri: imageUri,
        type: mimeType,
        name: fileName,
      } as any);
      
      // Append username
      formData.append('username', username);

      // Create headers for upload request
      const uploadHeaders: any = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      };

      // For mobile platforms, also include the refresh token in headers
      if (Platform.OS !== 'web') {
        uploadHeaders['X-Refresh-Token'] = REFRESH_TOKEN;
        // Remove cookie header as it's not needed for mobile
        // uploadHeaders['Cookie'] = `refreshToken=${REFRESH_TOKEN}`;
      }

      console.log(`[API] Upload headers:`, uploadHeaders);
      console.log(`[API] Making request to: ${API_BASE_URL}/uploadUserPortrait`);
      console.log(`[API] Token being used: ${token.substring(0, 20)}...`);
      console.log(`[API] Refresh token: ${REFRESH_TOKEN.substring(0, 20)}...`);

      // Make request with authorization header
      const response = await axios.post(`${API_BASE_URL}/uploadUserPortrait`, formData, {
        headers: uploadHeaders,
        withCredentials: Platform.OS === 'web',
        timeout: 60000, // 60 second timeout for upload
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`[API] Upload progress: ${progress}%`);
            
            // Call progress callback if provided
            if (onProgress) {
              onProgress(progress);
            }
          }
        },
      });

      console.log(`[API] Selfie uploaded successfully:`, response.data);
      
      // Format the response to match expected structure
      const formattedResponse: UploadSelfieResponse = {
        success: true, // Always true if we reach here
        message: response.data?.message || 'Selfie uploaded successfully',
        data: response.data,
      };
      
      return formattedResponse;
    } catch (error: any) {
      console.error('[API] Upload selfie error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        console.error('[API] 401 Error Details:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
          tokenLength: token?.length,
          tokenStart: token?.substring(0, 20),
          refreshTokenLength: REFRESH_TOKEN?.length,
          refreshTokenStart: REFRESH_TOKEN?.substring(0, 20)
        });
        
        if (error.response.data?.error?.includes('expired')) {
          throw new Error('Authentication token has expired. Please login again.');
        } else if (error.response.data?.error?.includes('invalid')) {
          throw new Error('Invalid authentication token. Please login again.');
        } else {
          throw new Error('Authentication failed. Please check your login and try again.');
        }
      } else if (error.response?.status === 413) {
        throw new Error('Image file too large. Please try with a smaller image.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid image format.');
      } else if (error.response?.status === 404) {
        throw new Error('Upload endpoint not found. Please check the API configuration.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timeout. Please check your internet connection.');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to upload selfie. Please try again.');
      }
    }
  }
}

export default AuthService;
