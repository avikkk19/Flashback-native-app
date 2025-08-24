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

// Add cookie header only for mobile platforms
if (Platform.OS !== 'web') {
  apiClient.defaults.headers['Cookie'] = `refreshToken=${REFRESH_TOKEN}`;
}

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
    return Promise.reject(error);
  }
);

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
   */
  static async uploadSelfie(
    imageUri: string,
    username: string,
    token: string
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

      // Add cookie header only for mobile platforms
      if (Platform.OS !== 'web') {
        uploadHeaders['Cookie'] = `refreshToken=${REFRESH_TOKEN}`;
      }

      console.log(`[API] Upload headers:`, uploadHeaders);
      console.log(`[API] Making request to: ${API_BASE_URL}/uploadUserPortrait`);

      // Make request with authorization header
      const response = await axios.post(`${API_BASE_URL}/uploadUserPortrait`, formData, {
        headers: uploadHeaders,
        withCredentials: Platform.OS === 'web',
        timeout: 60000, // 60 second timeout for upload
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`[API] Upload progress: ${progress}%`);
          }
        },
      });

      console.log(`[API] Selfie uploaded successfully:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error('[API] Upload selfie error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please login again.');
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
