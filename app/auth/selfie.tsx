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
import UnifiedAuthService from '@/services/unifiedApi';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function SelfieScreen() {
  const colorScheme = useColorScheme();
  const { user, token, setSelfieUrl } = useAuth();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    
    try {
      console.log('[SELFIE] Starting upload process...');
      console.log('[SELFIE] User:', user.username);
      console.log('[SELFIE] Token length:', token.length);
      
      const response = await UnifiedAuthService.uploadSelfie(
        capturedImage,
        user.username,
        token
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

        setUploadProgress(100);
        
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
            onCameraReady={() => console.log('[SELFIE] Camera ready')}
          >
            {/* Overlay */}
            <View style={styles.overlay}>
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
          </CameraView>
        )}
      </View>

      {/* Controls */}
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

              <TouchableOpacity
                style={[
                  styles.secondaryButton, 
                  { borderColor: Colors[colorScheme ?? 'light'].tabIconDefault }
                ]}
                onPress={retakeSelfie}
                disabled={isUploading}
              >
                <Text style={[styles.secondaryButtonText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                  Retake Photo
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  capturedImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#4CAF50',
    top: 0,
    left: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  cornerBottomLeft: {
    bottom: 0,
    top: 'auto',
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionsSubtitle: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
  controlsContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  uploadContainer: {
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  cameraControlsContainer: {
    alignItems: 'center',
  },
  cameraTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  cameraSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    width: '100%',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  skipButton: {
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    width: '100%',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
    marginTop: 8,
  },
  errorBanner: {
    backgroundColor: '#ffebee',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#ef5350',
  },
  errorBannerText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#ef5350',
  },
  errorMessageText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
  },
});
