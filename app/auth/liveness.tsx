import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
import LivenessDetectionService, { LivenessResult } from '@/services/livenessDetection';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function LivenessScreen() {
  const colorScheme = useColorScheme();
  const { completeLiveness } = useAuth();
  const cameraRef = useRef<any>(null);
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checkProgress, setCheckProgress] = useState(0);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [tips, setTips] = useState<string[]>([]);

  useEffect(() => {
    // Load instructions and tips
    setInstructions(LivenessDetectionService.getInstructions());
    setTips(LivenessDetectionService.getTips());
    
    // Set permission as granted for now (we'll handle camera later)
    setHasPermission(true);
  }, []);

  /**
   * Start liveness check
   */
  const startLivenessCheck = async () => {
    if (isChecking) return;

    setIsChecking(true);
    setCheckProgress(0);
    LivenessDetectionService.reset();

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setCheckProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 800); // 8 seconds total duration

      // Perform liveness check
      const result: LivenessResult = await LivenessDetectionService.performLivenessCheck(
        cameraRef,
        8000 // 8 seconds duration
      );

      clearInterval(progressInterval);
      setCheckProgress(100);

      // Handle result
      if (result.isLive) {
        // Mark liveness as completed
        await completeLiveness();
        
        Alert.alert(
          'Liveness Check Passed!',
          result.message,
          [
            {
              text: 'Continue',
              onPress: () => router.push('/auth/selfie'),
            },
          ]
        );
      } else {
        Alert.alert(
          'Liveness Check Failed',
          result.message,
          [
            {
              text: 'Try Again',
              onPress: () => {
                setIsChecking(false);
                LivenessDetectionService.reset();
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
      Alert.alert('Error', error.message || 'Liveness check failed. Please try again.');
    } finally {
      setIsChecking(false);
      setCheckProgress(0);
    }
  };

  if (hasPermission === null) {
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

  if (hasPermission === false) {
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Camera Preview Placeholder */}
      <View style={styles.cameraContainer}>
        <View style={[styles.camera, { backgroundColor: '#000' }]}>
          {/* Overlay */}
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
                  Analyzing liveness... {checkProgress}%
                </Text>
                <Text style={styles.blinkText}>
                  Please blink naturally during the check
                </Text>
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
            {!isChecking && (
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>Blink Detection</Text>
                <Text style={styles.instructionsSubtitle}>
                  Position your face in the frame and blink naturally
                </Text>
              </View>
            )}
          </View>
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
              >
                <Text style={styles.buttonText}>Start Blink Detection</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.checkingContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={[styles.checkingText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Performing blink detection...
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
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
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
});
