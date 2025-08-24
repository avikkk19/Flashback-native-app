import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
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
import AuthService, { testApiConnection } from '@/services/api';

const { width: screenWidth } = Dimensions.get('window');

export default function PhoneScreen() {
  const colorScheme = useColorScheme();
  const { login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle phone number submission
   */
  const handleSubmit = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    // Format phone number to E.164 format
    let formattedNumber = phoneNumber.trim();
    if (!formattedNumber.startsWith('+')) {
      if (formattedNumber.startsWith('0')) {
        formattedNumber = '+91' + formattedNumber.substring(1);
      } else if (formattedNumber.length === 10) {
        formattedNumber = '+91' + formattedNumber;
      } else {
        formattedNumber = '+' + formattedNumber;
      }
    }

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formattedNumber)) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Test API connection first
      const isConnected = await testApiConnection();
      if (!isConnected) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }

      console.log(`[API] Sending OTP to ${formattedNumber}`);
      const response = await AuthService.sendOTP(formattedNumber);
      
      console.log('[API] OTP sent successfully:', response);
      
      // Navigate to OTP screen
      router.push('/auth/otp');
    } catch (error: any) {
      console.error('[API] Send OTP error:', error);
      setError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Test API connection
   */
  const testConnection = async () => {
    try {
      const isConnected = await testApiConnection();
      Alert.alert(
        'Connection Test',
        isConnected ? '✅ Server connection successful!' : '❌ Server connection failed',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Connection Test', '❌ Connection test failed', [{ text: 'OK' }]);
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
            <Text style={styles.headerTitle}>
              Go ahead and set up your account
            </Text>
            <Text style={styles.headerSubtitle}>
              Sign in to enjoy the best authentication experience
            </Text>
          </View>

          {/* Main Content Card */}
          <View style={styles.contentCard}>
            {/* App Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>📱</Text>
              </View>
              <Text style={styles.appName}>Flashback</Text>
            </View>

            {/* Phone Input Section */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Enter your phone number</Text>
              <Text style={styles.sectionSubtitle}>
                We'll send you a verification code via WhatsApp
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <View style={styles.phoneInputRow}>
                    <View style={styles.countryCode}>
                      <Text style={styles.countryCodeText}>+91</Text>
                    </View>
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="Enter your phone number"
                      placeholderTextColor="#999"
                      value={phoneNumber}
                      onChangeText={(text) => {
                        setPhoneNumber(text);
                        setError(null);
                      }}
                      keyboardType="phone-pad"
                      maxLength={10}
                      autoFocus
                    />
                  </View>
                </View>

                {/* Error Message */}
                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { 
                      backgroundColor: isLoading 
                        ? Colors[colorScheme ?? 'light'].tabIconDefault 
                        : Colors[colorScheme ?? 'light'].tint 
                    }
                  ]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  <Text style={styles.submitButtonText}>
                    {isLoading ? 'Sending...' : 'Send Verification Code'}
                  </Text>
                </TouchableOpacity>

                {/* Terms and Privacy */}
                <View style={styles.termsContainer}>
                  <Text style={styles.termsText}>
                    By continuing, you agree to our{' '}
                    <Text style={styles.termsLink}>Terms of Service</Text>
                    {' '}and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Test Connection Button (Dev Only) */}
            {__DEV__ && (
              <TouchableOpacity
                style={styles.testButton}
                onPress={testConnection}
              >
                <Text style={styles.testButtonText}>🧪 Test Connection</Text>
              </TouchableOpacity>
            )}
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
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
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 30,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  inputSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  countryCode: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  errorContainer: {
    marginTop: 12,
    marginBottom: 24,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  submitButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  termsContainer: {
    alignItems: 'center',
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  termsLink: {
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
  testButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    marginTop: 12,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
