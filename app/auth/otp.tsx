import { Camera } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import UnifiedAuthService from '@/services/unifiedApi';

export default function OTPScreen() {
  const colorScheme = useColorScheme();
  const { login } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<TextInput[]>([]);
  const params = useLocalSearchParams();

  // Get phone number from navigation params
  const phoneNumber = params.phoneNumber as string || '+919876543210';

  useEffect(() => {
    // Start resend timer
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Request camera permissions for next screen
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        await Camera.requestCameraPermissionsAsync();
      } catch (error) {
        console.error('Error requesting camera permissions:', error);
      }
    };
    requestPermissions();
  }, []);

  /**
   * Handle OTP input change
   */
  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /**
   * Handle backspace
   */
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /**
   * Verify OTP
   */
  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    
    // Validate OTP format
    if (otpString.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit code.');
      return;
    }
    
    // Validate OTP contains only digits
    if (!/^\d{6}$/.test(otpString)) {
      Alert.alert('Invalid OTP', 'OTP should contain only numbers.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await UnifiedAuthService.verifyOTP(phoneNumber, otpString);
      
      console.log('OTP verification response:', response);
      
      if (response.success && response.accessToken) {
        // Create user object from phone number
        const user = {
          phoneNumber,
          username: phoneNumber,
        };
        
        // Login user with access token
        await login(user, response.accessToken);
        
        console.log('User logged in successfully, layout will handle navigation to liveness...');
        console.log('Current auth state after login:', { isAuthenticated: true, livenessCompleted: false });
        
        // Let the layout navigation handle the flow
        // The layout will automatically redirect to liveness since livenessCompleted is false
      } else {
        const errorMessage = response.error || response.message || 'Invalid OTP. Please try again.';
        Alert.alert('Verification Failed', errorMessage);
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      Alert.alert('Error', error.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Resend OTP
   */
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    try {
      const response = await UnifiedAuthService.sendOTP(phoneNumber);
      setResendTimer(30); // 30 seconds cooldown
      const message = response.message || 'A new verification code has been sent to your phone number.';
      Alert.alert('OTP Resent', message);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const otpString = otp.join('');
  const isOtpComplete = otpString.length === 6;
  const canResend = resendTimer === 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
              Verify OTP
            </Text>
            <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
              Enter the 6-digit code sent to {phoneNumber}
            </Text>
          </View>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Verification Code
            </Text>
            <View style={styles.otpInputs}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    if (ref) inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpInput,
                    {
                      backgroundColor: Colors[colorScheme ?? 'light'].background,
                      borderColor: digit 
                        ? Colors[colorScheme ?? 'light'].tint 
                        : Colors[colorScheme ?? 'light'].tabIconDefault,
                      color: Colors[colorScheme ?? 'light'].text,
                    },
                  ]}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: isOtpComplete 
                  ? Colors[colorScheme ?? 'light'].tint 
                  : Colors[colorScheme ?? 'light'].tabIconDefault,
              },
            ]}
            onPress={handleVerifyOTP}
            disabled={!isOtpComplete || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          {/* Resend OTP */}
          <View style={styles.resendContainer}>
            <Text style={[styles.resendText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
              Didn't receive the code?{' '}
            </Text>
            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={!canResend || isLoading}
            >
              <Text
                style={[
                  styles.resendButton,
                  {
                    color: canResend 
                      ? Colors[colorScheme ?? 'light'].tint 
                      : Colors[colorScheme ?? 'light'].tabIconDefault,
                  },
                ]}
              >
                {canResend ? 'Resend' : `Resend in ${resendTimer}s`}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <Text style={[styles.backButtonText, { color: Colors[colorScheme ?? 'light'].tint }]}>
              ← Back to Phone Number
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  otpContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  otpInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
  },
  resendButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
