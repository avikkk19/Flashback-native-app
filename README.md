# Flashback - React Native Liveness Detection App

A production-ready React Native application with advanced liveness detection using MediaPipe algorithms, secure authentication, and real-time selfie capture and upload.

## 🚀 Features

- **Advanced Liveness Detection**: MediaPipe-based facial landmark analysis
- **Secure Authentication**: JWT-based OTP verification system
- **Real-time Camera**: Live face detection and analysis
- **Selfie Capture**: High-quality image capture and upload
- **Production Ready**: Comprehensive error handling and security
- **Mobile Optimized**: Touch-friendly UI with real-time feedback
- **Development Mode**: Skip liveness detection for testing

## 📱 Screenshots

```
┌─────────────────────────────────┐
│ ← Back    Selfie Capture       │
├─────────────────────────────────┤
│                                 │
│        📷 Camera View           │
│                                 │
│    ┌─────────────┐              │
│    │ Face Frame  │              │
│    └─────────────┘              │
│                                 │
│    [Instructions]                │
├─────────────────────────────────┤
│                                 │
│    📱 Controls Panel            │
│                                 │
│    [Upload/Retake Buttons]      │
│                                 │
└─────────────────────────────────┘
```

## 🛠️ Setup & Run Instructions

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v8 or higher
- **Expo CLI**: Latest version
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Java 17** (for Android builds)

### Installation & Cloning Process

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flashback
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Expo CLI globally**
   ```bash
   npm install -g @expo/cli
   ```

4. **Install MediaPipe packages**
   ```bash
   npm install @mediapipe/face_mesh @mediapipe/camera_utils @mediapipe/drawing_utils
   ```

### Environment Configuration

#### Why `environment.ts` Instead of `.env`?

We use a TypeScript-based environment configuration (`config/environment.ts`) instead of traditional `.env` files for several reasons:

1. **Type Safety**: TypeScript provides compile-time type checking for environment variables
2. **IntelliSense**: Better IDE support with autocomplete and error detection
3. **Build-time Validation**: Environment variables are validated during build process
4. **Security**: Sensitive values can be encrypted or transformed before use
5. **Flexibility**: Complex configuration logic and computed values
6. **Version Control**: Environment configuration can be tracked in git with sensitive data removed

#### Environment Setup

1. **Create environment file**
   ```bash
   cp config/environment.example.ts config/environment.ts
   ```

2. **Configure environment variables**
   ```typescript
   // config/environment.ts
   export default {
     // API Configuration
     API_BASE_URL: 'https://your-api-domain.com/api/mobile',
     REFRESH_TOKEN: 'your-refresh-token',
     USE_MOCK_API: false,
     
     // App Configuration
     APP_NAME: 'Flashback',
     APP_VERSION: '1.0.0',
     
     // Feature Flags
     ENABLE_LIVENESS_CHECK: true,
     ENABLE_SELFIE_UPLOAD: true,
     ENABLE_DEV_SKIP_OPTIONS: true, // Skip liveness for development
     
     // Timeouts & Limits
     OTP_TIMEOUT: 300000, // 5 minutes
     LIVENESS_CHECK_DURATION: 30000, // 30 seconds
     UPLOAD_TIMEOUT: 60000, // 1 minute
     
     // Validation Rules
     PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
     OTP_LENGTH: 6,
     
     // UI Configuration
     ANIMATION_DURATION: 300,
     DEBOUNCE_DELAY: 500,
     
     // File Handling
     MAX_FILE_SIZE: 10485760, // 10MB
     COMPRESSION_QUALITY: 0.8,
     
     // Liveness Detection Parameters
     MIN_BLINK_COUNT: 1,
     MIN_FACE_DETECTION_RATE: 0.8,
     MAX_CONSECUTIVE_NO_FACE_FRAMES: 10,
     FRAME_PROCESSING_INTERVAL: 200, // 5 FPS
     CHECK_DURATION: 30000 // 30 seconds
   };
   ```

### Running the App

1. **Start development server**
   ```bash
   npm start
   ```

2. **Run on device/simulator**
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   
   # Web
   npm run web
   ```

3. **Build for production**
   ```bash
   # Android APK
   cd android
   ./gradlew assembleDebug    # Debug APK
   ./gradlew assembleRelease  # Release APK
   
   # iOS IPA
   expo build:ios --type archive
   ```

### How to Skip Liveness Detection

For development and testing purposes, you can skip the liveness detection:

1. **Enable dev skip options** in environment:
   ```typescript
   ENABLE_DEV_SKIP_OPTIONS: true
   ```

2. **Use the skip button** on the liveness screen (only visible in development mode)

3. **Programmatic skip** for automated testing:
   ```typescript
   // In development mode, you can programmatically skip
   if (__DEV__ && ENABLE_DEV_SKIP_OPTIONS) {
     // Skip liveness check
     navigation.navigate('selfie');
   }
   ```

## 🏗️ System Architecture

### Project Structure

```
flashback/
├── app/                          # Expo Router screens
│   ├── _layout.tsx              # Root layout with auth flow
│   ├── auth/                    # Authentication screens
│   │   ├── phone.tsx           # Phone number input
│   │   ├── otp.tsx             # OTP verification
│   │   ├── liveness.tsx        # Liveness detection
│   │   └── selfie.tsx          # Selfie capture & upload
│   └── (tabs)/                 # Main app tabs (after auth)
├── components/                   # Reusable UI components
│   ├── ApiStatusIndicator.tsx  # API status display
│   ├── DevIndicator.tsx        # Development mode indicator
│   ├── HapticTab.tsx           # Haptic feedback tab
│   ├── ThemedText.tsx          # Themed text component
│   ├── ThemedView.tsx          # Themed view component
│   └── ui/                     # UI-specific components
├── contexts/                     # React Context providers
│   └── AuthContext.tsx         # Authentication state management
├── services/                     # Business logic services
│   ├── api.ts                  # API client and endpoints
│   ├── faceDetectionService.ts # MediaPipe liveness detection
│   ├── livenessDetection.ts    # Liveness detection logic
│   └── unifiedApi.ts           # API service wrapper
├── config/                       # Configuration files
│   └── environment.ts          # Environment variables
├── constants/                    # App constants and themes
│   └── Colors.ts               # Color scheme definitions
├── hooks/                        # Custom React hooks
│   ├── useColorScheme.ts       # Theme management
│   └── useThemeColor.ts        # Color utilities
└── assets/                       # Images, fonts, etc.
```

### Architecture Patterns

#### 1. **Expo Router Architecture**
- **File-based routing** for intuitive navigation
- **Stack navigation** for authentication flow
- **Tab navigation** for main app sections
- **Deep linking** support for external access
- **Layout-based structure** for consistent UI

#### 2. **Context API State Management**
- **Global authentication state** via AuthContext
- **Persistent storage** using AsyncStorage
- **Real-time updates** for UI components
- **Secure token management**
- **State synchronization** across components

#### 3. **Service Layer Pattern**
- **Separation of concerns** between UI and business logic
- **API abstraction** for backend communication
- **Error handling** and retry mechanisms
- **Progress tracking** for long-running operations
- **Service composition** for complex operations

#### 4. **Component Composition**
- **Reusable components** for consistent UI
- **Props-based configuration** for flexibility
- **Event-driven interactions** for user actions
- **Responsive design** for mobile optimization
- **Theme-aware components** for dark/light mode

### Data Flow Architecture

#### **Authentication Flow:**
```
User Input → Phone Screen → OTP Screen → Liveness Screen → Selfie Screen → Main App
    ↓              ↓           ↓           ↓            ↓           ↓
Validation → API Call → Token → Detection → Upload → Success
```

#### **Liveness Detection Flow:**
```
Camera Feed → Frame Capture → MediaPipe Processing → Landmark Analysis → Liveness Check → Result
    ↓              ↓              ↓              ↓            ↓           ↓
Real-time → 200ms Intervals → Face Mesh → Feature Extraction → Criteria → Pass/Fail
```

#### **API Communication Flow:**
```
Component → Service → API Client → HTTP Request → Backend → Response → State Update → UI
    ↓          ↓         ↓           ↓           ↓         ↓          ↓         ↓
User Action → Business Logic → Data Layer → Network → Server → Data → Context → Component
```

#### **State Management Flow:**
```
User Action → Component → Context → Service → API → Response → Context Update → UI Re-render
    ↓           ↓          ↓         ↓        ↓       ↓          ↓           ↓
Event → Handler → Dispatch → Action → Call → Data → State → Component Update
```

### Security Architecture

#### **Authentication Security:**
- **JWT tokens** with configurable expiration
- **Refresh token rotation** for session security
- **Secure storage** using AsyncStorage encryption
- **Token validation** on every API request
- **Automatic logout** on token expiration

#### **Data Security:**
- **HTTPS communication** for all API calls
- **Input validation** and sanitization
- **File upload security** with size and type validation
- **Error message sanitization** to prevent information leakage
- **Secure error handling** without exposing system details

#### **Liveness Security:**
- **Multi-factor detection** (blink, head movement, mouth activity)
- **Temporal validation** to prevent rapid-fire attempts
- **Spatial consistency** checks for face positioning
- **Anti-spoofing measures** against photos and videos
- **Real-time processing** to prevent pre-recorded attacks

## 🔍 Liveness Detection Logic

### Overview

The liveness detection system implements **MediaPipe-based facial landmark analysis** to ensure the user is a real, live person and not a photo, video, or 3D model. The system uses a multi-factor approach combining blink detection, head movement, and mouth activity.

### Core Algorithm

#### 1. **Eye Aspect Ratio (EAR) Calculation**

```typescript
// Calculate EAR for blink detection
const calculateEyeAspectRatio = (landmarks: any[], eyePoints: number[]): number => {
  const p = eyePoints.map(i => landmarks[i]);
  
  // Vertical distances
  const v1 = calculateDistance(p[1], p[5]);
  const v2 = calculateDistance(p[2], p[4]);
  
  // Horizontal distance
  const h = calculateDistance(p[0], p[3]);
  
  // EAR = (v1 + v2) / (2.0 * h)
  return (v1 + v2) / (2.0 * h);
};
```

**EAR Thresholds:**
- **< 0.20**: Eye closed (blink detected)
- **≥ 0.25**: Eye open (reset blink state)
- **Blink Cooldown**: 500ms minimum between blinks

#### 2. **Head Movement Detection**

```typescript
// Track nose tip position for head movement
const detectHeadMovement = (landmarks: any[]): { movement: number; newNoseX: number } => {
  const nose = landmarks[NOSE_TIP];
  const currentNoseX = nose.x;
  
  if (prevNoseX !== null) {
    const movement = Math.abs(currentNoseX - prevNoseX);
    return { movement, newNoseX: currentNoseX };
  }
  
  return { movement: 0, newNoseX: currentNoseX };
};
```

**Movement Threshold:**
- **> 0.02**: Significant head movement detected
- **Movement Cooldown**: 1000ms minimum between movements
- **Direction Changes**: Tracks left/right movement patterns

#### 3. **Mouth Activity Detection**

```typescript
// Measure mouth opening distance
const calculateMouthOpening = (landmarks: any[]): number => {
  const top = landmarks[MOUTH_TOP];
  const bottom = landmarks[MOUTH_BOTTOM];
  return calculateDistance(top, bottom);
};
```

**Mouth Threshold:**
- **> 0.04**: Mouth open (activity detected)
- **Activity Cooldown**: 800ms minimum between activities
- **Natural Patterns**: Detects natural mouth movements

### Liveness Criteria

#### **Required Actions (All Must Pass):**

1. **Minimum 1 Blink**
   - EAR < 0.20 for blink detection
   - EAR ≥ 0.25 to reset blink state
   - Prevents rapid-fire blinking
   - Natural blink timing validation

2. **Head Movement Required**
   - Nose position change > 0.02
   - Detects natural head motion
   - Prevents static photo attacks
   - Tracks movement patterns

3. **Mouth Activity**
   - At least 2 mouth opening detections
   - Distance > 0.04 for each detection
   - Ensures live person interaction
   - Natural movement validation

4. **Face Detection Rate**
   - 80% minimum face detection rate
   - Consistent face presence throughout
   - Prevents partial face attacks
   - Real-time monitoring

#### **Confidence Calculation:**

```typescript
const overallConfidence = (
  blinkConfidence + 
  headMovementConfidence + 
  mouthConfidence + 
  faceConfidence
) / 4;

// Each factor contributes equally to overall confidence
// Minimum confidence threshold: 0.75 (75%)
```

### Real-Time Processing

#### **Frame Analysis Cycle:**

1. **Capture Frame** (every 200ms - 5 FPS)
   - High-quality camera capture
   - Base64 encoding for processing
   - Metadata extraction (dimensions, size)
   - Frame timestamp tracking

2. **Landmark Detection**
   - MediaPipe face mesh processing
   - 468 facial landmark points
   - 3D coordinate extraction
   - Confidence scoring

3. **Feature Analysis**
   - EAR calculation for both eyes
   - Head movement tracking
   - Mouth activity measurement
   - Real-time validation

4. **Liveness Assessment**
   - Real-time criteria checking
   - Progress tracking
   - Immediate feedback
   - Success/failure determination

#### **Performance Optimizations:**

- **Frame rate**: 5 FPS (200ms intervals) for optimal performance
- **Image quality**: 0.5 (balanced quality/speed)
- **Processing**: Async operations with non-blocking UI
- **Memory**: Efficient landmark storage and cleanup
- **Battery**: Optimized camera usage and processing

### Security Features

#### **Anti-Spoofing Measures:**

1. **Multi-Factor Liveness**
   - Blink + Head movement + Mouth activity
   - All factors must be detected
   - Prevents single-factor bypass
   - Temporal relationship validation

2. **Temporal Validation**
   - Minimum time between actions
   - Natural movement patterns
   - Prevents robotic behavior
   - Human-like timing requirements

3. **Spatial Consistency**
   - Face must remain in frame
   - Consistent landmark positions
   - Prevents partial face attacks
   - Position stability validation

4. **Motion Validation**
   - Real-time movement detection
   - Natural gesture patterns
   - Prevents static image attacks
   - Dynamic behavior analysis

### User Experience

#### **Real-Time Guidance:**

```
1. "Face detected! Please blink naturally..."
2. "Great! 1 blink detected. Please move your head slightly..."
3. "Head movement detected! Now open your mouth slightly..."
4. "Perfect! Liveness check passed!"
```

#### **Progress Indicators:**

- **Visual progress bar** showing completion percentage
- **Real-time status updates** for each action
- **Immediate feedback** for detected movements
- **Clear success/failure** messaging with next steps

#### **Error Handling:**

- **Graceful degradation** for edge cases
- **Helpful error messages** for users
- **Retry mechanisms** for failed attempts
- **Fallback options** for technical issues
- **User guidance** for common problems

## 🧪 Testing

### Manual Testing

1. **Liveness Detection**
   - Test with real person
   - Test with photo (should fail)
   - Test with video (should fail)
   - Test edge cases (glasses, lighting)
   - Test with different face angles

2. **Authentication Flow**
   - Phone number validation
   - OTP verification
   - Token management
   - Session handling
   - Error scenarios

3. **Selfie Upload**
   - Image capture quality
   - Upload progress tracking
   - Error handling
   - Success flow
   - Network interruption handling

### Development Testing

#### **Skip Liveness for Testing:**

```typescript
// Enable in environment.ts
ENABLE_DEV_SKIP_OPTIONS: true

// Use skip button on liveness screen
// Or programmatically skip in development mode
if (__DEV__ && ENABLE_DEV_SKIP_OPTIONS) {
  // Skip liveness check for testing
  navigation.navigate('selfie');
}
```

### Automated Testing

```bash
# Run tests
npm test

# Run specific test suites
npm test -- --grep "liveness"
npm test -- --grep "authentication"
npm test -- --grep "selfie"
```

## 🚀 Deployment

### Production Build

1. **Environment Configuration**
   ```bash
   # Set production environment
   export NODE_ENV=production
   
   # Update environment.ts for production
   USE_MOCK_API: false
   ENABLE_DEV_SKIP_OPTIONS: false
   ```

2. **Build Commands**
   ```bash
   # Android APK
   cd android
   ./gradlew assembleDebug    # Debug APK
   ./gradlew assembleRelease  # Release APK
   
   # iOS IPA
   expo build:ios --type archive
   ```

3. **APK Location**
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   android/app/build/outputs/apk/release/app-release.apk
   ```

4. **App Store Deployment**
   - Configure app signing
   - Set bundle identifiers
   - Upload to stores
   - Monitor analytics

### Performance Monitoring

- **Frame processing time** tracking
- **Memory usage** monitoring
- **Battery consumption** analysis
- **User interaction** analytics
- **Liveness detection success rate**
- **API response times**

## 🔧 Troubleshooting

### Common Issues

1. **Camera Permission Denied**
   - Check device settings
   - Restart app
   - Clear app data
   - Verify camera permissions

2. **Liveness Detection Failing**
   - Ensure good lighting
   - Remove glasses/hats
   - Perform natural movements
   - Check camera focus
   - Verify face positioning

3. **Upload Failures**
   - Verify internet connection
   - Check API endpoint
   - Validate authentication token
   - Review error logs
   - Check file size limits

4. **Build Failures**
   - Verify Java 17 installation
   - Check Android SDK versions
   - Update Gradle wrapper
   - Clear build cache

### Debug Mode

Enable debug logging:

```typescript
// In development mode
if (__DEV__) {
  console.log('[DEBUG] Detailed information');
  console.log('[DEBUG] Liveness detection:', livenessData);
  console.log('[DEBUG] API response:', apiResponse);
}
```

### Development Tools

```bash
# Clear build cache
cd android
./gradlew clean

# Reset Metro cache
npx expo start --clear

# Check environment variables
echo $NODE_ENV
echo $JAVA_HOME
```

## 📚 API Reference

### Authentication Endpoints

- `POST /sendOTP` - Send OTP to phone number
- `POST /verifyOTP` - Verify OTP and get token
- `POST /uploadUserPortrait` - Upload selfie image

### Request/Response Formats

See `services/api.ts` for detailed API specifications.

### Environment Variables

See `config/environment.ts` for all available configuration options.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with React Native, Expo, MediaPipe, and TypeScript**

**Version**: 1.0.0  
**Last Updated**: 2024  
**Maintainer**: Flashback Team
