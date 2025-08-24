
// Mock API responses for development
export interface SendOTPResponse {
  success: boolean;
  message: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    phoneNumber: string;
    username: string;
  };
}

export interface UploadSelfieResponse {
  success: boolean;
  message: string;
  imageUrl?: string;
}

// Mock API Service for development
export class MockAuthService {
  private static mockToken = 'mock-jwt-token-12345';
  private static mockUser = {
    phoneNumber: '+919876543210',
    username: '+919876543210',
  };

  /**
   * Mock send OTP - always succeeds
   */
  static async sendOTP(phoneNumber: string): Promise<SendOTPResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`[MOCK API] 📱 Sending OTP to ${phoneNumber}`);
    console.log(`[MOCK API] ✅ OTP sent successfully`);
    
    return {
      success: true,
      message: 'OTP sent successfully',
    };
  }

  /**
   * Mock verify OTP - accepts any 6-digit code
   */
  static async verifyOTP(phoneNumber: string, otp: string): Promise<VerifyOTPResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`[MOCK API] 🔐 Verifying OTP ${otp} for ${phoneNumber}`);
    
    // Accept any 6-digit OTP for testing
    if (otp.length === 6 && /^\d{6}$/.test(otp)) {
      console.log(`[MOCK API] ✅ OTP verified successfully`);
      console.log(`[MOCK API] 🎫 Generated mock token: ${this.mockToken}`);
      
      return {
        success: true,
        message: 'OTP verified successfully',
        token: this.mockToken,
        user: {
          phoneNumber,
          username: phoneNumber,
        },
      };
    } else {
      console.log(`[MOCK API] ❌ Invalid OTP format`);
      throw new Error('Invalid OTP format');
    }
  }

  /**
   * Mock upload selfie - always succeeds
   */
  static async uploadSelfie(
    imageUri: string,
    username: string,
    token: string
  ): Promise<UploadSelfieResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`[MOCK API] 📸 Uploading selfie for ${username}`);
    console.log(`[MOCK API] 🖼️ Image URI: ${imageUri}`);
    console.log(`[MOCK API] 🎫 Using token: ${token}`);
    
    // Generate a mock image URL
    const mockImageUrl = `https://mock-api.flashback.inc/selfies/${username}-${Date.now()}.jpg`;
    
    console.log(`[MOCK API] ✅ Selfie uploaded successfully`);
    console.log(`[MOCK API] 🔗 Mock image URL: ${mockImageUrl}`);
    
    return {
      success: true,
      message: 'Selfie uploaded successfully',
      imageUrl: mockImageUrl,
    };
  }
}

export default MockAuthService;
