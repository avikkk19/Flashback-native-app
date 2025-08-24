import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { user, logout } = useAuth();

  /**
   * Handle logout
   */
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>Welcome to Flashback!</ThemedText>
          <ThemedText style={styles.subtitle}>
            Your authentication journey is complete
          </ThemedText>
        </View>

        {/* User Info Card */}
        <ThemedView style={styles.userCard}>
          <View style={styles.userInfo}>
            <ThemedText style={styles.userTitle}>User Information</ThemedText>
            
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Phone Number:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {user?.phoneNumber || 'Not available'}
              </ThemedText>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Username:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {user?.username || 'Not available'}
              </ThemedText>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Status:</ThemedText>
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <ThemedText style={styles.statusText}>Verified</ThemedText>
              </View>
            </View>
          </View>
        </ThemedView>

        {/* Selfie Section */}
        <ThemedView style={styles.selfieCard}>
          <ThemedText style={styles.selfieTitle}>Your Selfie</ThemedText>
          
          {user?.selfieUrl ? (
            <View style={styles.selfieContainer}>
              <Image 
                source={{ uri: user.selfieUrl }} 
                style={styles.selfieImage}
                resizeMode="cover"
              />
              <ThemedText style={styles.selfieCaption}>
                Successfully uploaded and verified
              </ThemedText>
            </View>
          ) : (
            <View style={styles.noSelfieContainer}>
              <View style={styles.noSelfieIcon}>
                <ThemedText style={styles.noSelfieIconText}>📷</ThemedText>
              </View>
              <ThemedText style={styles.noSelfieText}>
                No selfie uploaded yet
              </ThemedText>
              <ThemedText style={styles.noSelfieSubtext}>
                Complete the authentication flow to upload your selfie
              </ThemedText>
            </View>
          )}
        </ThemedView>

        {/* Authentication Flow Summary */}
        <ThemedView style={styles.summaryCard}>
          <ThemedText style={styles.summaryTitle}>Authentication Summary</ThemedText>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>1</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Phone Verification</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Successfully verified your phone number with OTP
              </ThemedText>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>2</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Liveness Check</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Completed on-device liveness detection
              </ThemedText>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>3</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Selfie Upload</ThemedText>
              <ThemedText style={styles.stepDescription}>
                {user?.selfieUrl ? 'Successfully uploaded selfie to backend' : 'Selfie upload pending'}
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: Colors[colorScheme ?? 'light'].tabIconDefault }]}
          onPress={handleLogout}
        >
          <ThemedText style={[styles.logoutButtonText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
            Logout
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
    opacity: 0.8,
  },
  userCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userInfo: {
    gap: 16,
  },
  userTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  selfieCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selfieTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  selfieContainer: {
    alignItems: 'center',
  },
  selfieImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 12,
  },
  selfieCaption: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  noSelfieContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noSelfieIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  noSelfieIconText: {
    fontSize: 32,
  },
  noSelfieText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  noSelfieSubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  logoutButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
