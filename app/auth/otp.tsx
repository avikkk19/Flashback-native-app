import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import AuthService from '@/services/api';

const { width: screenWidth } = Dimensions.get('window');

export default function OTPScreen() {
  const colorScheme = useColorScheme();
  const { login } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<TextInput[]>([]);

  // Start resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  /**
   * Handle OTP input change
   */
  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setError(null);

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
    
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // For now, we'll use a mock phone number since we don't have it in context
      // In a real app, you'd pass this through navigation params or context
      const phoneNumber = '+919966431616'; // This should come from previous screen
      
      console.log(`[API] Verifying OTP ${otpString} for ${phoneNumber}`);
      const response = await AuthService.verifyOTP(phoneNumber, otpString);
      
      console.log('[API] OTP verification successful:', response);
      
      // Login user with the response data
      const token = response.accessToken || '';
      await login(
        {
          phoneNumber: phoneNumber,
          username: phoneNumber,
        },
        token
      );
      
      // Navigation will be handled by the layout based on auth state
    } catch (error: any) {
      console.error('[API] OTP verification error:', error);
      setError(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Resend OTP
   */
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    try {
      const phoneNumber = '+919966431616'; // This should come from previous screen
      await AuthService.sendOTP(phoneNumber);
      
      setResendTimer(30); // 30 second cooldown
      Alert.alert('OTP Sent', 'A new verification code has been sent to your phone.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend OTP. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>
              Verify your account
            </Text>
            <Text style={styles.headerSubtitle}>
              Enter the 6-digit verification code sent to your phone
            </Text>
          </View>

          {/* Main Content Card */}
          <View style={styles.contentCard}>
            {/* Success Icon */}
            <View style={styles.successIconContainer}>
              <View style={styles.successIcon}>
                <Text style={styles.successIconText}>✓</Text>
              </View>
            </View>

            {/* OTP Input Section */}
            <View style={styles.otpSection}>
              <Text style={styles.otpTitle}>Enter Verification Code</Text>
              <Text style={styles.otpSubtitle}>
                We've sent a 6-digit code to +91 •••• •••• 16
              </Text>

              {/* OTP Input Boxes */}
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      if (ref) inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      digit && styles.otpInputFilled
                    ]}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    autoFocus={index === 0}
                  />
                ))}
              </View>

              {/* Error Message */}
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Verify Button */}
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  { 
                    backgroundColor: isLoading 
                      ? '#E0E0E0' 
                      : '#4CAF50' 
                  }
                ]}
                onPress={handleVerifyOTP}
                disabled={isLoading || otp.join('').length !== 6}
              >
                <Text style={styles.verifyButtonText}>
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Text>
              </TouchableOpacity>

              {/* Resend OTP */}
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code? </Text>
                <TouchableOpacity
                  onPress={handleResendOTP}
                  disabled={resendTimer > 0}
                >
                  <Text style={[
                    styles.resendLink,
                    resendTimer > 0 && styles.resendLinkDisabled
                  ]}>
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 10,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 20,
    color: Colors.light.tint,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    color: Colors.light.tabIconDefault,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
    width: '100%',
  },
  successIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  otpSection: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.light.text,
  },
  otpSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    color: Colors.light.tabIconDefault,
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,
    gap: 8,
    marginBottom: 32,
  },
  otpInput: {
    width: 42,
    height: 48,
    borderWidth: 2,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    borderColor: Colors.light.tabIconDefault,
    color: Colors.light.text,
    marginLeft: -10,
  },
  otpInputFilled: {
    borderColor: Colors.light.tint,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    width: '100%',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
  },
  verifyButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  verifyButtonText: {
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
    color: Colors.light.tabIconDefault,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  resendLinkDisabled: {
    color: '#B0BEC5',
  },
});
