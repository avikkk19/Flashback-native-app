import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import FaceDetectionService from '@/services/faceDetectionService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function LivenessScreen() {
  const colorScheme = useColorScheme();
  const { completeLiveness } = useAuth();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  
  const [isChecking, setIsChecking] = useState(false);
  const [checkProgress, setCheckProgress] = useState(0);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [blinkCount, setBlinkCount] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [facePosition, setFacePosition] = useState<string>('unknown');
  const [faceSize, setFaceSize] = useState<string>('unknown');
  const [detectionConfidence, setDetectionConfidence] = useState<number>(0);
  const [currentStatus, setCurrentStatus] = useState('Position your face in the frame');
  const [isInitializing, setIsInitializing] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  
  // Animation for blink detection
  const blinkAnimation = useRef(new Animated.Value(1)).current;
  const [lastBlinkCount, setLastBlinkCount] = useState(0);

  // Trigger blink animation when blink count increases
  useEffect(() => {
    if (blinkCount > lastBlinkCount) {
      // Animate the blink indicator
      Animated.sequence([
        Animated.timing(blinkAnimation, {
          toValue: 1.5,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      setLastBlinkCount(blinkCount);
    }
  }, [blinkCount, lastBlinkCount, blinkAnimation]);

  // Debug state changes
  useEffect(() => {
    console.log('[LIVENESS] State changed:', {
      faceDetected,
      blinkCount,
      currentStatus,
      detectionConfidence,
      isChecking
    });
  }, [faceDetected, blinkCount, currentStatus, detectionConfidence, isChecking]);

  useEffect(() => {
    // Load instructions and tips
    setInstructions(FaceDetectionService.getInstructions());
    setTips(FaceDetectionService.getTips());
    
    // Request camera permissions if not granted
    if (!permission?.granted) {
      requestPermission();
    }

    // Initialize face detection service
    initializeService();
  }, []);

  /**
   * Initialize the face detection service
   */
  const initializeService = async () => {
    try {
      setIsInitializing(true);
      setInitializationError(null);
      
      await FaceDetectionService.initialize();
      console.log('Face detection service initialized successfully');
    } catch (error: any) {
      console.error('Failed to initialize face detection service:', error);
      setInitializationError(error.message || 'Failed to initialize face detection');
    } finally {
      setIsInitializing(false);
    }
  };

  /**
   * Start liveness check
   */
  const startLivenessCheck = async () => {
    if (!cameraRef.current) {
      Alert.alert('Error', 'Camera not ready. Please try again.');
      return;
    }

    setIsChecking(true);
    setCheckProgress(0);
    setCurrentStatus('Starting liveness check...');
    setBlinkCount(0);
    setFaceDetected(false);

    const startTime = Date.now();
    const totalDuration = 8000; // 8 seconds

    try {
      // Start the actual liveness check with progress callback
      const result = await FaceDetectionService.performLivenessCheck(
        cameraRef, 
        8000,
        {
          onBlinkDetected: (blinkCount) => {
            console.log('[LIVENESS] onBlinkDetected callback triggered with:', blinkCount);
            setBlinkCount(blinkCount);
            console.log('[LIVENESS] Blink count state updated to:', blinkCount);
          },
          onFaceDetected: (hasFace, confidence) => {
            console.log('[LIVENESS] onFaceDetected callback triggered with:', { hasFace, confidence });
            setFaceDetected(hasFace);
            setDetectionConfidence(confidence);
            console.log('[LIVENESS] Face detection state updated to:', { hasFace, confidence });
            
            // Force a re-render to ensure UI updates
            setTimeout(() => {
              console.log('[LIVENESS] Forcing re-render after face detection update');
            }, 100);
          },
          onProgress: (progress) => {
            console.log('[LIVENESS] onProgress callback triggered with:', progress);
            setCheckProgress(progress);
            console.log('[LIVENESS] Progress state updated to:', progress);
          },
          onStatusUpdate: (status) => {
            console.log('[LIVENESS] onStatusUpdate callback triggered with:', status);
            setCurrentStatus(status);
            console.log('[LIVENESS] Status state updated to:', status);
          }
        }
      );
      
      // Update final results
      setBlinkCount(result.detectedBlinks);
      setFaceDetected(result.faceDetected);
      setFacePosition(result.facePosition);
      setFaceSize(result.faceSize);
      setDetectionConfidence(result.confidence);
      setCheckProgress(100);

      if (result.isLive) {
        setCurrentStatus('Liveness check completed successfully!');
        // Mark liveness as completed
        completeLiveness();
        // Navigate to selfie screen
        router.push('/auth/selfie');
      } else {
        setCurrentStatus('Liveness check failed. Please try again.');
        Alert.alert(
          'Liveness Check Failed',
          result.message,
          [
            {
              text: 'Try Again',
              onPress: () => {
                resetLivenessCheck();
              },
            },
            {
              text: 'Go Back',
              onPress: () => router.back(),
              style: 'cancel',
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Liveness check error:', error);
      Alert.alert(
        'Error', 
        error.message || 'Liveness check failed. Please try again.',
        [
          {
            text: 'Try Again',
            onPress: () => {
              resetLivenessCheck();
            },
          },
          {
            text: 'Go Back',
            onPress: () => router.back(),
            style: 'cancel',
          },
        ]
      );
    } finally {
      setIsChecking(false);
    }
  };

  /**
   * Reset liveness check state
   */
  const resetLivenessCheck = () => {
    setIsChecking(false);
    setBlinkCount(0);
    setFaceDetected(false);
    setFacePosition('unknown');
    setFaceSize('unknown');
    setDetectionConfidence(0);
    setCurrentStatus('Position your face in the frame');
    FaceDetectionService.reset();
  };

  /**
   * Retry initialization
   */
  const retryInitialization = () => {
    initializeService();
  };

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading liveness detection...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission?.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Camera Access Required
          </Text>
          <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
            This app needs camera access to perform liveness detection. Please grant camera permissions in your device settings.
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

  if (isInitializing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Initializing face detection...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (initializationError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Initialization Failed
          </Text>
          <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
            {initializationError}
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={retryInitialization}
          >
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault, marginTop: 12 }]}
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
      
      {/* Camera Preview */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
          onCameraReady={() => console.log('[CAMERA] Camera ready')}
          barcodeScannerSettings={{
            barcodeTypes: [],
          }}
        />
        
        {/* Overlay positioned absolutely over camera */}
        <View style={styles.overlay}>
          {/* Progress Bar */}
          {isChecking && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${checkProgress}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                Analyzing liveness... {Math.round(checkProgress)}%
              </Text>
              
              {/* Real-time Face Detection Status */}
              <View style={styles.faceStatusContainer}>
                <Text style={styles.faceStatusTitle}>Face Detection Status:</Text>
                <View style={[
                  styles.faceStatusIndicator,
                  { backgroundColor: faceDetected ? '#4CAF50' : '#FF5722' }
                ]}>
                  <Text style={styles.faceStatusText}>
                    {faceDetected ? '✓ FACE DETECTED' : '✗ NO FACE'}
                  </Text>
                </View>
                <Text style={styles.faceStatusConfidence}>
                  Confidence: {Math.round(detectionConfidence * 100)}%
                </Text>
              </View>
              
              {/* Real-time Blink Counter */}
              <View style={styles.blinkCounterContainer}>
                <Text style={styles.blinkCounterTitle}>Blinks Detected:</Text>
                <Animated.Text 
                  style={[
                    styles.blinkCounterNumber,
                    { transform: [{ scale: blinkAnimation }] }
                  ]}
                >
                  {blinkCount}
                </Animated.Text>
                <Text style={styles.blinkCounterTarget}>/ 3 needed</Text>
                
                {/* Blink Detection Indicator */}
                {blinkCount > 0 && (
                  <View style={styles.blinkIndicator}>
                    <Text style={styles.blinkIndicatorText}>✓</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.statusText}>
                Face: {faceDetected ? '✓' : '✗'} | Confidence: {Math.round(detectionConfidence * 100)}%
              </Text>
              
              {/* Debug Panel - Remove in production */}
              {__DEV__ && (
                <View style={styles.debugPanel}>
                  <Text style={styles.debugTitle}>Debug Info:</Text>
                  <Text style={styles.debugText}>Face Detected: {faceDetected.toString()}</Text>
                  <Text style={styles.debugText}>Blink Count: {blinkCount}</Text>
                  <Text style={styles.debugText}>Confidence: {detectionConfidence.toFixed(2)}</Text>
                  <Text style={styles.debugText}>Progress: {Math.round(checkProgress)}%</Text>
                  <Text style={styles.debugText}>Status: {currentStatus}</Text>
                </View>
              )}
            </View>
          )}

          {/* Face Frame */}
          <View style={styles.faceFrame}>
            <View style={styles.corner} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
            
            {/* Face Detection Indicator - Always Visible */}
            <View style={[
              styles.faceIndicator,
              { backgroundColor: faceDetected ? '#4CAF50' : '#FF5722' }
            ]}>
              <Text style={styles.faceIndicatorText}>
                {faceDetected ? 'FACE DETECTED' : 'NO FACE'}
              </Text>
              <Text style={styles.faceIndicatorSubtext}>
                Confidence: {Math.round(detectionConfidence * 100)}%
              </Text>
            </View>
          </View>

          {/* Instructions */}
          {!isChecking && (
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Liveness Check</Text>
              <Text style={styles.instructionsSubtitle}>
                Position your face in the frame and blink naturally
              </Text>
              
              {/* Test Face Detection Button */}
              <TouchableOpacity
                style={[styles.testButton, { backgroundColor: faceDetected ? '#4CAF50' : '#FF9800' }]}
                onPress={async () => {
                  try {
                    const result = await FaceDetectionService.processFrame(cameraRef);
                    setFaceDetected(result.hasFace);
                    setDetectionConfidence(result.confidence);
                    console.log('[LIVENESS] Test face detection result:', result);
                  } catch (error) {
                    console.error('[LIVENESS] Test face detection error:', error);
                  }
                }}
              >
                <Text style={styles.testButtonText}>
                  {faceDetected ? '✓ Face Detected' : 'Test Face Detection'}
                </Text>
              </TouchableOpacity>
              
              {/* Manual Refresh Button */}
              <TouchableOpacity
                style={[styles.testButton, { backgroundColor: '#2196F3', marginTop: 8 }]}
                onPress={() => {
                  console.log('[LIVENESS] Manual refresh - Current state:', {
                    faceDetected,
                    blinkCount,
                    currentStatus,
                    detectionConfidence
                  });
                  // Force a re-render
                  setFaceDetected(prev => prev);
                }}
              >
                <Text style={styles.testButtonText}>Refresh State</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Real-time Status */}
          {isChecking && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                {currentStatus}
              </Text>
              <Text style={styles.detailedStatus}>
                Position: {facePosition} | Size: {faceSize}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Controls */}
      <View style={[styles.controlsContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        {!isChecking ? (
          <>
            {/* Instructions */}
            <ScrollView style={styles.instructionsList} showsVerticalScrollIndicator={false}>
              <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Instructions
              </Text>
              {instructions.map((instruction, index) => (
                <Text key={index} style={[styles.instruction, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                  • {instruction}
                </Text>
              ))}
              
              <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text, marginTop: 16 }]}>
                Tips
              </Text>
              {tips.map((tip, index) => (
                <Text key={index} style={[styles.instruction, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                  • {tip}
                </Text>
              ))}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
                onPress={startLivenessCheck}
                disabled={isInitializing}
              >
                <Text style={styles.buttonText}>Start Liveness Check</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.checkingContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={[styles.checkingText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Performing liveness detection...
            </Text>
            <Text style={[styles.checkingSubtext, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
              Please blink naturally 2-3 times
            </Text>
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
    position: 'relative',
  },
  camera: {
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
  progressContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  blinkText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8,
  },
  faceFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    alignSelf: 'center',
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
    maxHeight: screenHeight * 0.4,
  },
  instructionsList: {
    maxHeight: 200,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  checkingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  checkingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  checkingSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  promptContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  promptText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  detailedStatus: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.8,
  },
  faceIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -20 }],
    width: 200,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  faceIndicatorText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  faceIndicatorSubtext: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.8,
  },
  testButton: {
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 15,
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  blinkCounterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  blinkCounterTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  blinkCounterNumber: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  blinkCounterTarget: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
  blinkIndicator: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  blinkIndicatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  faceStatusContainer: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  faceStatusTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  faceStatusIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  faceStatusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  faceStatusConfidence: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  debugPanel: {
    position: 'absolute',
    top: 100,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 8,
    zIndex: 10,
  },
  debugTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 4,
  },
});
