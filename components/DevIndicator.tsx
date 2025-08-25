import ENVIRONMENT from '@/config/environment';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const DevIndicator: React.FC = () => {
  if (!__DEV__ || !ENVIRONMENT.USE_MOCK_API) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>🔧 MOCK API</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1000,
  },
  text: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
