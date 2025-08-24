import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { testApiConnection, validateToken } from '@/services/api';
import UnifiedAuthService from '@/services/unifiedApi';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function SelfieScreen() {
  const colorScheme = useColorScheme();
  const { user, token, setSelfieUrl, logout } = useAuth();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    // Request camera permissions if not granted
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  /**
   * Capture selfie with improved error handling
   */
  const captureSelfie = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    setCaptureError(null);
    
    try {
      console.log('[SELFIE] Starting photo capture...');
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
        exif: false,
      });

      console.log('[SELFIE] Photo captured successfully:', {
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
      });

      if (!photo.uri) {
        throw new Error('Failed to capture photo - no URI returned');
      }

      setCapturedImage(photo.uri);
      console.log('[SELFIE] Selfie captured and stored');
      
    } catch (error: any) {
      console.error('[SELFIE] Error capturing photo:', error);
      const errorMessage = error.message || 'Failed to capture photo. Please try again.';
      setCaptureError(errorMessage);
      Alert.alert('Capture Error', errorMessage);
    } finally {
      setIsCapturing(false);
    }
  };

  /**
   * Retake selfie
   */
  const retakeSelfie = () => {
    setCapturedImage(null);
    setCaptureError(null);
    setUploadError(null);
    setUploadProgress(0);
  };

  /**
   * Test API connection
   */
  const testConnection = async () => {
    try {
      console.log('[SELFIE] Testing API connection...');
      const isConnected = await testApiConnection();
      
      if (isConnected) {
        Alert.alert('Connection Test', '✅ API connection successful! Server is reachable.');
      } else {
        Alert.alert('Connection Test', '❌ API connection failed. Please check your internet connection and try again.');
      }
    } catch (error: any) {
      Alert.alert('Connection Test', `❌ Connection test failed: ${error.message}`);
    }
  };

  /**
   * Handle logout when token expires
   */
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Your session has expired. You will be redirected to login.',
      [
        {
          text: 'OK',
          onPress: async () => {
            try {
              await logout();
              console.log('[SELFIE] Logged out due to expired token');
              router.replace('/auth/phone');
            } catch (error) {
              console.error('[SELFIE] Logout error:', error);
              router.replace('/auth/phone');
            }
          },
        },
      ]
    );
  };

  /**
   * Upload selfie to backend with improved error handling
   */
  const uploadSelfie = async () => {
    if (!capturedImage || !user || !token) {
      const missingData = [];
      if (!capturedImage) missingData.push('selfie image');
      if (!user) missingData.push('user data');
      if (!token) missingData.push('authentication token');
      
      Alert.alert('Error', `Missing required data: ${missingData.join(', ')}. Please try again.`);
      return;
    }

    // Validate token before upload
    if (!validateToken(token)) {
      Alert.alert(
        'Authentication Error',
        'Your login session has expired. Please login again.',
        [
          {
            text: 'OK',
            onPress: () => handleLogout(),
          },
        ]
      );
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    
    try {
      console.log('[SELFIE] Starting upload process...');
      console.log('[SELFIE] User:', user.username);
      console.log('[SELFIE] Token length:', token.length);
      console.log('[SELFIE] Image URI:', capturedImage);
      console.log('[SELFIE] Token validation:', validateToken(token));
      
      const response = await UnifiedAuthService.uploadSelfie(
        capturedImage,
        user.username,
        token,
        (progress) => {
          console.log('[SELFIE] Upload progress:', progress);
          setUploadProgress(progress);
        }
      );

      console.log('[SELFIE] Upload response:', response);

      if (response.success) {
        // Save selfie URL to user context
        if (response.imageUrl || response.portraitUrl) {
          const selfieUrl = response.imageUrl || response.portraitUrl;
          if (selfieUrl) {
            await setSelfieUrl(selfieUrl);
            console.log('[SELFIE] Selfie URL saved to context:', selfieUrl);
          }
        }

        Alert.alert(
          'Success! 🎉',
          'Your selfie has been uploaded successfully. You can now proceed to the main app.',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } else {
        const errorMessage = response.message || response.error || 'Failed to upload selfie. Please try again.';
        setUploadError(errorMessage);
        Alert.alert('Upload Failed', errorMessage);
      }
    } catch (error: any) {
      console.error('[SELFIE] Upload error:', error);
      const errorMessage = error.message || 'Failed to upload selfie. Please try again.';
      setUploadError(errorMessage);
      Alert.alert('Upload Error', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Show loading state while requesting permissions
  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Requesting camera permission...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if camera permission denied
  if (!permission?.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Camera Access Required
          </Text>
          <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
            This app needs camera access to capture your selfie. Please grant camera permissions in your device settings.
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Selfie Capture</Text>
          {token && (
            <View style={[
              styles.tokenStatus, 
              { backgroundColor: validateToken(token) ? '#4CAF50' : '#f44336' }
            ]}>
              <Text style={styles.tokenStatusText}>
                {validateToken(token) ? 'Token Valid' : 'Token Expired'}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      {/* Camera Preview or Captured Image */}
      <View style={styles.cameraContainer}>
        {capturedImage ? (
          <Image 
            source={{ uri: capturedImage }} 
            style={styles.capturedImage}
            resizeMode="cover"
          />
        ) : (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
            onCameraReady={() => {
              console.log('[SELFIE] Camera ready');
              setIsCameraReady(true);
            }}
          />
        )}
        
        {/* Overlay positioned absolutely over camera */}
        {!capturedImage && (
          <View style={styles.overlay}>
            {/* Camera Loading Overlay */}
            {!isCameraReady && (
              <View style={styles.cameraLoadingOverlay}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.cameraLoadingText}>Initializing camera...</Text>
              </View>
            )}
            
            {/* Face Frame */}
            <View style={styles.faceFrame}>
              <View style={styles.corner} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Take your selfie</Text>
              <Text style={styles.instructionsSubtitle}>
                Position your face in the frame and tap the camera button
              </Text>
            </View>

            {/* Error Display */}
            {captureError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{captureError}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Controls - Always visible at bottom */}
      <View style={[styles.controlsContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        {capturedImage ? (
          // After capture - show upload options
          <View style={styles.uploadContainer}>
            <Text style={[styles.uploadTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Review Your Selfie
            </Text>
            <Text style={[styles.uploadSubtitle, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
              Make sure your face is clearly visible and well-lit
            </Text>

            {/* Upload Progress */}
            {isUploading && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${uploadProgress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  Uploading... {uploadProgress}%
                </Text>
              </View>
            )}

            {/* Debug Info Panel */}
            {__DEV__ && (
              <View style={styles.debugPanel}>
                <Text style={styles.debugTitle}>Debug Info:</Text>
                <Text style={styles.debugText}>User: {user?.username || 'Unknown'}</Text>
                <Text style={styles.debugText}>Token: {token ? `${token.substring(0, 20)}...` : 'Missing'}</Text>
                <Text style={styles.debugText}>Image: {capturedImage ? 'Captured' : 'Not captured'}</Text>
                <Text style={styles.debugText}>Upload Status: {isUploading ? 'In Progress' : 'Ready'}</Text>
                <Text style={styles.debugText}>Progress: {uploadProgress}%</Text>
              </View>
            )}

            {/* Error Display */}
            {uploadError && (
              <View style={styles.errorMessage}>
                <Text style={styles.errorMessageText}>{uploadError}</Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button, 
                  { 
                    backgroundColor: isUploading 
                      ? Colors[colorScheme ?? 'light'].tabIconDefault 
                      : Colors[colorScheme ?? 'light'].tint 
                  }
                ]}
                onPress={uploadSelfie}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Upload Selfie</Text>
                )}
              </TouchableOpacity>

              {/* Test Connection Button */}
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  { borderColor: Colors[colorScheme ?? 'light'].tabIconDefault }
                ]}
                onPress={testConnection}
              >
                <Text style={[styles.secondaryButtonText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                  Test API Connection
                </Text>
              </TouchableOpacity>

              {/* Debug Token Button */}
              {__DEV__ && (
                <TouchableOpacity
                  style={[
                    styles.secondaryButton,
                    { borderColor: Colors[colorScheme ?? 'light'].tabIconDefault }
                  ]}
                  onPress={() => {
                    const isValid = validateToken(token || '');
                    Alert.alert(
                      'Token Debug Info',
                      `Token Length: ${token?.length || 0}\n` +
                      `Token Start: ${token?.substring(0, 30) || 'None'}...\n` +
                      `Is Valid: ${isValid ? 'Yes' : 'No'}\n` +
                      `User: ${user?.username || 'Unknown'}`
                    );
                  }}
                >
                  <Text style={[styles.secondaryButtonText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                    Debug Token
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  { borderColor: Colors[colorScheme ?? 'light'].tabIconDefault }
                ]}
                onPress={handleLogout}
              >
                <Text style={[styles.secondaryButtonText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                  Logout (Expired Token)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  { borderColor: Colors[colorScheme ?? 'light'].tabIconDefault }
                ]}
                onPress={retakeSelfie}
                disabled={isUploading}
              >
                <Text style={[styles.secondaryButtonText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                  Retake Selfie
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Before capture - show camera controls
          <View style={styles.cameraControlsContainer}>
            <Text style={[styles.cameraTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Capture Your Selfie
            </Text>
            <Text style={[styles.cameraSubtitle, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
              Ensure good lighting and a neutral expression
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.captureButton, 
                  { 
                    backgroundColor: isCapturing 
                      ? Colors[colorScheme ?? 'light'].tabIconDefault 
                      : Colors[colorScheme ?? 'light'].tint 
                  }
                ]}
                onPress={captureSelfie}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <View style={styles.captureButtonInner} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Dark background for camera
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
  },
  tokenStatus: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 5,
  },
  tokenStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 50, // Adjust as needed for spacing
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  capturedImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 1,
  },
  cameraLoadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 18,
    fontWeight: '600',
  },
  faceFrame: {
    width: 280, // Larger for mobile
    height: 280,
    position: 'relative',
    alignSelf: 'center',
  },
  corner: {
    position: 'absolute',
    width: 35, // Larger corners for mobile
    height: 35,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#4CAF50',
    top: 0,
    left: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    top: 'auto',
    borderTopWidth: 0,
    borderBottomWidth: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 120, // Better positioning for mobile
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 15,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  instructionsTitle: {
    color: 'white',
    fontSize: 20, // Larger for mobile
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionsSubtitle: {
    color: 'white',
    fontSize: 16, // Larger for mobile
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
  },
  controlsContainer: {
    paddingHorizontal: 20, // Reduced for mobile
    paddingTop: 20,
    paddingBottom: 30, // Reduced for mobile
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  uploadContainer: {
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 22, // Larger for mobile
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadSubtitle: {
    fontSize: 16, // Larger for mobile
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  cameraControlsContainer: {
    alignItems: 'center',
  },
  cameraTitle: {
    fontSize: 22, // Larger for mobile
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  cameraSubtitle: {
    fontSize: 16, // Larger for mobile
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    height: 56,
    borderRadius: 16, // Larger radius for mobile
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16, // More spacing for mobile
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 18, // Larger for mobile
    fontWeight: '600',
  },
  secondaryButton: {
    height: 48, // Slightly larger for mobile
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2, // Thicker border for mobile
    width: '100%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  secondaryButtonText: {
    fontSize: 16, // Larger for mobile
    fontWeight: '500',
  },
  captureButton: {
    width: 90, // Larger for mobile
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButtonInner: {
    width: 70, // Larger for mobile
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
  },
  skipButton: {
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    width: '100%',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    height: 10, // Thicker for mobile
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 16, // Larger for mobile
    color: '#333',
    marginTop: 10,
    fontWeight: '500',
  },
  errorBanner: {
    backgroundColor: '#ffebee',
    paddingVertical: 15, // More padding for mobile
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#ef5350',
    marginHorizontal: 20,
  },
  errorBannerText: {
    color: '#d32f2f',
    fontSize: 16, // Larger for mobile
    textAlign: 'center',
    fontWeight: '500',
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#ef5350',
  },
  errorMessageText: {
    color: '#d32f2f',
    fontSize: 16, // Larger for mobile
    textAlign: 'center',
    fontWeight: '500',
  },
  debugPanel: {
    backgroundColor: '#f8f9fa',
    padding: 20, // More padding for mobile
    borderRadius: 12,
    marginTop: 20,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginBottom: 20,
  },
  debugTitle: {
    fontSize: 18, // Larger for mobile
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#495057',
  },
  debugText: {
    fontSize: 16, // Larger for mobile
    marginBottom: 6,
    color: '#6c757d',
    fontFamily: 'monospace',
  },
  logoutButton: {
    padding: 10,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#333',
  },
});
