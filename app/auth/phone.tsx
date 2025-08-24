import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
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

import { ApiStatusIndicator } from '@/components/ApiStatusIndicator';
import ENVIRONMENT from '@/config/environment';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { testApiConnection } from '@/services/api';
import UnifiedAuthService from '@/services/unifiedApi';

export default function PhoneScreen() {
  const colorScheme = useColorScheme();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  /**
   * Test API connection before sending OTP
   */
  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const isConnected = await testApiConnection();
      if (isConnected) {
        Alert.alert('Connection Test', '✅ API connection successful!');
      } else {
        Alert.alert('Connection Test', '❌ API connection failed. Please check your internet connection and try again.');
      }
    } catch (error: any) {
      Alert.alert('Connection Test', `❌ Connection test failed: ${error.message}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  /**
   * Validate phone number format (E.164)
   */
  const validatePhoneNumber = (phone: string): boolean => {
    return ENVIRONMENT.PHONE_REGEX.test(phone);
  };

  /**
   * Handle phone number input with formatting
   */
  const handlePhoneChange = (text: string) => {
    // Remove all non-digit characters except +
    const cleaned = text.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +91
    if (!cleaned.startsWith('+91')) {
      setPhoneNumber('+91');
    } else {
      setPhoneNumber(cleaned);
    }
  };

  /**
   * Send OTP to the provided phone number
   */
  const handleSendOTP = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid Indian phone number in the format +91XXXXXXXXXX'
      );
      return;
    }

    setIsLoading(true);
    try {
      // Test connection first
      const isConnected = await testApiConnection();
      if (!isConnected) {
        Alert.alert(
          'Connection Error',
          'Unable to connect to the server. Please check your internet connection and try again.',
          [
            { text: 'OK' },
            { text: 'Test Connection', onPress: testConnection }
          ]
        );
        return;
      }

      const response = await UnifiedAuthService.sendOTP(phoneNumber);
      
      // Show success message from API
      const message = response.message || 'A verification code has been sent to your phone number.';
      
      Alert.alert(
        'OTP Sent',
        message,
        [
          {
            text: 'Continue',
            onPress: () => router.push({
              pathname: '/auth/otp',
              params: { phoneNumber }
            }),
          },
        ]
      );
    } catch (error: any) {
      console.error('Send OTP error:', error);
      
      if (error.message?.includes('Network Error')) {
        Alert.alert(
          'Network Error',
          'Unable to connect to the server. Please check your internet connection and try again.',
          [
            { text: 'OK' },
            { text: 'Test Connection', onPress: testConnection }
          ]
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isPhoneValid = validatePhoneNumber(phoneNumber);
  const isButtonDisabled = !isPhoneValid || isLoading;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ApiStatusIndicator />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
              Welcome to Flashback
            </Text>
            <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
              Enter your phone number to get started
            </Text>
          </View>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Phone Number
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme ?? 'light'].background,
                  borderColor: isPhoneValid ? Colors[colorScheme ?? 'light'].tint : Colors[colorScheme ?? 'light'].tabIconDefault,
                  color: Colors[colorScheme ?? 'light'].text,
                },
              ]}
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              placeholder="+91XXXXXXXXXX"
              placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
              keyboardType="phone-pad"
              autoFocus
              maxLength={13}
            />
            {phoneNumber && !isPhoneValid && (
              <Text style={styles.errorText}>
                Please enter a valid Indian phone number
              </Text>
            )}
          </View>

          {/* Send OTP Button */}
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: isButtonDisabled 
                  ? Colors[colorScheme ?? 'light'].tabIconDefault 
                  : Colors[colorScheme ?? 'light'].tint,
              },
            ]}
            onPress={handleSendOTP}
            disabled={isButtonDisabled}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </TouchableOpacity>

          {/* Test Connection Button */}
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                borderColor: Colors[colorScheme ?? 'light'].tabIconDefault,
                marginTop: 12,
              },
            ]}
            onPress={testConnection}
            disabled={isTestingConnection}
          >
            {isTestingConnection ? (
              <ActivityIndicator color={Colors[colorScheme ?? 'light'].tabIconDefault} />
            ) : (
              <Text style={[styles.secondaryButtonText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                Test Connection
              </Text>
            )}
          </TouchableOpacity>

          {/* Info Text */}
          <Text style={[styles.infoText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
            We'll send a verification code to your phone number
          </Text>
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
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
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
  secondaryButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
