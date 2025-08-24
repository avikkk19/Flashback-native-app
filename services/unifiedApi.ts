import ENVIRONMENT from '@/config/environment';
import AuthService from './api';

// Unified API Service that uses real API
export class UnifiedAuthService {
  /**
   * Send OTP to the provided phone number
   */
  static async sendOTP(phoneNumber: string) {
    return AuthService.sendOTP(phoneNumber);
  }

  /**
   * Verify OTP with the provided credentials
   */
  static async verifyOTP(phoneNumber: string, otp: string) {
    return AuthService.verifyOTP(phoneNumber, otp);
  }

  /**
   * Upload selfie image to the backend
   */
  static async uploadSelfie(
    imageUri: string, 
    username: string, 
    token: string,
    onProgress?: (progress: number) => void
  ) {
    return AuthService.uploadSelfie(imageUri, username, token, onProgress);
  }
}

// Export types
export type { SendOTPResponse, VerifyOTPResponse, UploadSelfieResponse } from './api';

export default UnifiedAuthService;
