import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import UnifiedAuthService from '@/services/unifiedApi';

export const ApiStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkApiConnection = async () => {
    setStatus('checking');
    try {
      // Try to send a test OTP to check API connectivity
      await UnifiedAuthService.sendOTP('+919876543210');
      setStatus('connected');
      setLastCheck(new Date());
    } catch (error) {
      console.error('API connection test failed:', error);
      setStatus('error');
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkApiConnection();
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'checking':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'API Connected';
      case 'error':
        return 'API Error';
      case 'checking':
        return 'Checking API...';
      default:
        return 'Unknown';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={checkApiConnection}>
      <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
      <Text style={styles.text}>{getStatusText()}</Text>
      {lastCheck && (
        <Text style={styles.timestamp}>
          {lastCheck.toLocaleTimeString()}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timestamp: {
    color: 'white',
    fontSize: 8,
    marginLeft: 4,
    opacity: 0.7,
  },
});
