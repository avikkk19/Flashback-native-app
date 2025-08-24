import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Explore Flashback</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Authentication Features</ThemedText>
          <ThemedText>
            This app demonstrates a complete authentication flow including:
          </ThemedText>
          <ThemedText>• Phone number verification with OTP</ThemedText>
          <ThemedText>• On-device liveness detection</ThemedText>
          <ThemedText>• Selfie capture and upload</ThemedText>
          <ThemedText>• Secure token management</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Technical Stack</ThemedText>
          <ThemedText>• React Native with Expo</ThemedText>
          <ThemedText>• TypeScript for type safety</ThemedText>
          <ThemedText>• Expo Router for navigation</ThemedText>
          <ThemedText>• Expo Camera for image capture</ThemedText>
          <ThemedText>• AsyncStorage for data persistence</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Security Features</ThemedText>
          <ThemedText>• On-device liveness detection</ThemedText>
          <ThemedText>• No external SDK dependencies</ThemedText>
          <ThemedText>• Secure API communication</ThemedText>
          <ThemedText>• Input validation and sanitization</ThemedText>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
    gap: 8,
  },
});
