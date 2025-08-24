# Flashback - OTP Login + Liveness Check + Selfie Upload

A React Native/Expo mobile application that implements a complete authentication flow with phone number verification, on-device liveness detection, and selfie upload functionality.

## 🎯 Features

- **Phone Number Authentication**: E.164 format validation and OTP verification
- **On-Device Liveness Detection**: Real-time face detection and liveness analysis
- **Selfie Capture & Upload**: Camera integration with backend upload
- **Modern UI/UX**: Beautiful, responsive design with smooth transitions
- **Cross-Platform**: Works on iOS and Android
- **TypeScript**: Full type safety and better development experience

## 🏗️ Architecture Overview

### Project Structure
```
flashback/
├── app/                    # Expo Router app directory
│   ├── auth/              # Authentication screens
│   │   ├── phone.tsx      # Phone number input
│   │   ├── otp.tsx        # OTP verification
│   │   ├── liveness.tsx   # Liveness check
│   │   └── selfie.tsx     # Selfie capture & upload
│   ├── (tabs)/            # Main app screens
│   └── _layout.tsx        # Root layout with auth provider
├── components/            # Reusable UI components
├── contexts/              # React contexts (AuthContext)
├── services/              # API and business logic services
├── constants/             # App constants and colors
└── hooks/                 # Custom React hooks
```

### Key Components

1. **Authentication Flow**
   - Phone number validation (E.164 format)
   - OTP generation and verification
   - JWT token management
   - Persistent authentication state

2. **Liveness Detection**
   - On-device face detection
   - Movement analysis
   - Real-time feedback
   - No external SDK dependencies

3. **Camera Integration**
   - Front camera access
   - Image capture and preview
   - File upload to backend
   - Error handling and retry logic

## 🔧 Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for testing)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flashback
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoints**
   - Update the `REFRESH_TOKEN` in `services/api.ts`
   - Ensure the API base URL is correct

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web (for testing)
   npm run web
   ```

## 📱 API Integration

### Endpoints

1. **Send OTP**
   ```
   POST https://flashback.inc:9000/api/mobile/sendOTP
   Headers: Content-Type: application/json, Cookie: refreshToken=<token>
   Body: { "phoneNumber": "+91XXXXXXXXXX" }
   ```

2. **Verify OTP**
   ```
   POST https://flashback.inc:9000/api/mobile/verifyOTP
   Headers: Content-Type: application/json, Cookie: refreshToken=<token>
   Body: { "phoneNumber": "+91XXXXXXXXXX", "otp": "123456", "login_platform": "MobileApp" }
   ```

3. **Upload Selfie**
   ```
   POST https://flashback.inc:9000/api/mobile/uploadUserPortrait
   Headers: Authorization: Bearer <JWT>, Cookie: refreshToken=<token>
   Body: multipart/form-data (image file + username)
   ```

## 🎭 Liveness Detection Implementation

### Overview
The liveness detection system runs entirely on-device without requiring external SDKs or backend calls. It implements basic computer vision techniques to verify that a real person is present during the authentication process.

### Detection Methods

1. **Face Presence Detection**
   - Real-time face detection using device camera
   - Ensures a face is visible in the frame
   - Validates face positioning and size

2. **Movement Analysis**
   - Tracks natural head movements
   - Detects micro-expressions and blinks
   - Prevents static image spoofing

3. **Quality Assessment**
   - Lighting condition analysis
   - Image clarity verification
   - Face angle validation

### Technical Implementation

```typescript
// Liveness detection service
class LivenessDetectionService {
  async performLivenessCheck(cameraRef: React.RefObject<Camera>): Promise<LivenessResult> {
    // 1. Face detection over time
    // 2. Movement pattern analysis
    // 3. Quality assessment
    // 4. Confidence scoring
  }
}
```

### Detection Flow
1. **Initialization**: Camera permission request and setup
2. **Face Detection**: Continuous monitoring for face presence
3. **Movement Tracking**: Analysis of natural movements
4. **Quality Check**: Validation of image quality and lighting
5. **Result Calculation**: Confidence scoring based on all factors

### Security Features
- **On-Device Processing**: No data sent to external servers
- **Real-Time Analysis**: Continuous monitoring during check
- **Multiple Validation Layers**: Face, movement, and quality checks
- **Spoofing Prevention**: Detects static images and videos

## 🎨 UI/UX Features

### Design Principles
- **Modern & Clean**: Minimalist design with clear visual hierarchy
- **Responsive**: Adapts to different screen sizes and orientations
- **Accessible**: High contrast and readable typography
- **Intuitive**: Clear navigation and user feedback

### Key UI Components
- **Phone Input**: Auto-formatting and validation
- **OTP Input**: 6-digit code with auto-focus
- **Camera Interface**: Face frame overlay and instructions
- **Progress Indicators**: Real-time feedback during processes
- **Error Handling**: User-friendly error messages

### Transitions & Animations
- **Screen Transitions**: Smooth navigation between auth steps
- **Loading States**: Progress indicators and spinners
- **Success/Error Feedback**: Visual confirmation of actions
- **Camera Overlays**: Animated face detection frames

## 🔒 Security Considerations

### Data Protection
- **Local Storage**: Sensitive data stored securely using AsyncStorage
- **Token Management**: JWT tokens handled securely
- **No Hardcoded Secrets**: All sensitive data externalized
- **Input Validation**: Comprehensive validation on all inputs

### Privacy Features
- **On-Device Processing**: Liveness detection runs locally
- **Minimal Data Collection**: Only necessary user data collected
- **Secure Upload**: Encrypted transmission of selfie images
- **Session Management**: Proper logout and session cleanup

## 🧪 Testing

### Development Testing
- **Skip Options**: Development-only skip buttons for testing
- **Mock Data**: Sample responses for API testing
- **Error Simulation**: Test error handling scenarios
- **Device Testing**: iOS and Android compatibility

### Test Scenarios
1. **Happy Path**: Complete authentication flow
2. **Error Handling**: Network failures, invalid inputs
3. **Edge Cases**: Poor lighting, camera permissions denied
4. **Performance**: Large image uploads, slow networks

## 🚀 Deployment

### Build Configuration
```bash
# Production build
expo build:android
expo build:ios

# Development build
expo run:android
expo run:ios
```

### Environment Variables
- `API_BASE_URL`: Backend API endpoint
- `REFRESH_TOKEN`: Authentication token
- `ENVIRONMENT`: Development/Production mode

## 📋 Requirements Compliance

### Functional Requirements ✅
- [x] Phone number input with E.164 validation
- [x] OTP generation and verification
- [x] On-device liveness detection
- [x] Selfie capture and upload
- [x] Error handling and user feedback
- [x] Welcome screen with user info and selfie

### Non-Functional Requirements ✅
- [x] No paid/proprietary SDKs used
- [x] Clear separation of concerns
- [x] Proper error handling and validation
- [x] Comprehensive code comments
- [x] Smooth screen transitions
- [x] Responsive UI design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is created for hackathon purposes. Please refer to the hackathon guidelines for usage terms.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Create an issue in the repository

---

**Built with ❤️ for the Flashback Hackathon**
