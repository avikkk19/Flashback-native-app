# Flashback - React Native Liveness Detection App

A production-ready React Native application with advanced liveness detection using MediaPipe algorithms, secure authentication, and real-time selfie capture and upload.

## 🚀 Features

- **Advanced Liveness Detection**: MediaPipe-based facial landmark analysis
- **Secure Authentication**: JWT-based OTP verification system
- **Real-time Camera**: Live face detection and analysis
- **Selfie Capture**: High-quality image capture and upload
- **Production Ready**: Comprehensive error handling and security
- **Mobile Optimized**: Touch-friendly UI with real-time feedback

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

### Installation

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

1. **Create environment file**
   ```bash
   cp config/environment.example.ts config/environment.ts
   ```

2. **Configure API endpoints**
   ```typescript
   // config/environment.ts
   export default {
     API_BASE_URL: 'https://your-api-domain.com/api/mobile',
     REFRESH_TOKEN: 'your-refresh-token',
     // ... other config
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
   expo build:android
   
   # iOS IPA
   expo build:ios
   ```

## 🏗️ App Architecture Overview

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
├── contexts/                     # React Context providers
│   └── AuthContext.tsx         # Authentication state management
├── services/                     # Business logic services
│   ├── api.ts                  # API client and endpoints
│   ├── faceDetectionService.ts # MediaPipe liveness detection
│   └── unifiedApi.ts           # API service wrapper
├── config/                       # Configuration files
│   └── environment.ts          # Environment variables
├── constants/                    # App constants and themes
├── hooks/                        # Custom React hooks
└── assets/                       # Images, fonts, etc.
```

### Architecture Patterns

#### 1. **Expo Router Architecture**
- **File-based routing** for intuitive navigation
- **Stack navigation** for authentication flow
- **Tab navigation** for main app sections
- **Deep linking** support for external access

#### 2. **Context API State Management**
- **Global authentication state** via AuthContext
- **Persistent storage** using AsyncStorage
- **Real-time updates** for UI components
- **Secure token management**

#### 3. **Service Layer Pattern**
- **Separation of concerns** between UI and business logic
- **API abstraction** for backend communication
- **Error handling** and retry mechanisms
- **Progress tracking** for long-running operations

#### 4. **Component Composition**
- **Reusable components** for consistent UI
- **Props-based configuration** for flexibility
- **Event-driven interactions** for user actions
- **Responsive design** for mobile optimization

### Data Flow

```
User Input → Component → Service → API → Backend
    ↑                                    ↓
UI Update ← Context ← State ← Response ← Data
```

### Security Features

- **JWT authentication** with refresh tokens
- **Secure storage** using AsyncStorage
- **Input validation** and sanitization
- **HTTPS communication** for all API calls
- **Token expiration** handling

## 🔍 Liveness Detection Logic-----------------------------------

### Overview

The liveness detection system implements **MediaPipe-based facial landmark analysis** to ensure the user is a real, live person and not a photo, video, or 3D model.

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

### Liveness Criteria

#### **Required Actions (All Must Pass):**

1. **Minimum 1 Blink**
   - EAR < 0.20 for blink detection
   - EAR ≥ 0.25 to reset blink state
   - Prevents rapid-fire blinking

2. **Head Movement Required**
   - Nose position change > 0.02
   - Detects natural head motion
   - Prevents static photo attacks

3. **Mouth Activity**
   - At least 2 mouth opening detections
   - Distance > 0.04 for each detection
   - Ensures live person interaction

4. **Face Detection Rate**
   - 80% minimum face detection rate
   - Consistent face presence throughout
   - Prevents partial face attacks

#### **Confidence Calculation:**

```typescript
const overallConfidence = (
  blinkConfidence + 
  headMovementConfidence + 
  mouthConfidence + 
  faceConfidence
) / 4;
```

### Real-Time Processing

#### **Frame Analysis Cycle:**

1. **Capture Frame** (every 200ms)
   - High-quality camera capture
   - Base64 encoding for processing
   - Metadata extraction (dimensions, size)

2. **Landmark Detection**
   - MediaPipe face mesh processing
   - 468 facial landmark points
   - 3D coordinate extraction

3. **Feature Analysis**
   - EAR calculation for both eyes
   - Head movement tracking
   - Mouth activity measurement

4. **Liveness Assessment**
   - Real-time criteria checking
   - Progress tracking
   - Immediate feedback

#### **Performance Optimizations:**

- **Frame rate**: 5 FPS (200ms intervals)
- **Image quality**: 0.5 (balanced quality/speed)
- **Processing**: Async operations
- **Memory**: Efficient landmark storage
- **Battery**: Optimized camera usage

### Security Features

#### **Anti-Spoofing Measures:**

1. **Multi-Factor Liveness**
   - Blink + Head movement + Mouth activity
   - All factors must be detected
   - Prevents single-factor bypass

2. **Temporal Validation**
   - Minimum time between actions
   - Natural movement patterns
   - Prevents robotic behavior

3. **Spatial Consistency**
   - Face must remain in frame
   - Consistent landmark positions
   - Prevents partial face attacks

4. **Motion Validation**
   - Real-time movement detection
   - Natural gesture patterns
   - Prevents static image attacks

### User Experience

#### **Real-Time Guidance:**

```
1. "Face detected! Please blink naturally..."
2. "Great! 1 blink detected. Please move your head slightly..."
3. "Head movement detected! Now open your mouth slightly..."
4. "Perfect! Liveness check passed!"
```

#### **Progress Indicators:**

- **Visual progress bar** showing completion
- **Real-time status updates** for each action
- **Immediate feedback** for detected movements
- **Clear success/failure** messaging

#### **Error Handling:**

- **Graceful degradation** for edge cases
- **Helpful error messages** for users
- **Retry mechanisms** for failed attempts
- **Fallback options** for technical issues

## 🧪 Testing

### Manual Testing

1. **Liveness Detection**
   - Test with real person
   - Test with photo (should fail)
   - Test with video (should fail)
   - Test edge cases (glasses, lighting)

2. **Authentication Flow**
   - Phone number validation
   - OTP verification
   - Token management
   - Session handling

3. **Selfie Upload**
   - Image capture quality
   - Upload progress tracking
   - Error handling
   - Success flow

### Automated Testing

```bash
# Run tests
npm test

# Run specific test suites
npm test -- --grep "liveness"
npm test -- --grep "authentication"
```

## 🚀 Deployment

### Production Build

1. **Environment Configuration**
   ```bash
   # Set production environment
   export NODE_ENV=production
   ```

2. **Build Commands**
```bash
   # Android APK
   expo build:android --type apk
   
   # iOS IPA
   expo build:ios --type archive
   ```

3. **App Store Deployment**
   - Configure app signing
   - Set bundle identifiers
   - Upload to stores
   - Monitor analytics

### Performance Monitoring

- **Frame processing time** tracking
- **Memory usage** monitoring
- **Battery consumption** analysis
- **User interaction** analytics

## 🔧 Troubleshooting

### Common Issues

1. **Camera Permission Denied**
   - Check device settings
   - Restart app
   - Clear app data

2. **Liveness Detection Failing**
   - Ensure good lighting
   - Remove glasses/hats
   - Perform natural movements
   - Check camera focus

3. **Upload Failures**
   - Verify internet connection
   - Check API endpoint
   - Validate authentication token
   - Review error logs

### Debug Mode

Enable debug logging:

```typescript
// In development mode
if (__DEV__) {
  console.log('[DEBUG] Detailed information');
}
```

## 📚 API Reference

### Authentication Endpoints

- `POST /sendOTP` - Send OTP to phone number
- `POST /verifyOTP` - Verify OTP and get token
- `POST /uploadUserPortrait` - Upload selfie image

### Request/Response Formats

See `services/api.ts` for detailed API specifications.


**Built with ❤️ using React Native, Expo, and MediaPipe**
