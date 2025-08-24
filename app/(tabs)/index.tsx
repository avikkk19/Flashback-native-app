import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { user, logout } = useAuth();
  const [showFullSelfie, setShowFullSelfie] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

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

  /**
   * Show full selfie modal
   */
  const showSelfieModal = () => {
    setShowFullSelfie(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  /**
   * Hide full selfie modal
   */
  const hideSelfieModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowFullSelfie(false);
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        <View style={styles.welcomeHeader}>
          <LinearGradient
            colors={colorScheme === 'dark' 
              ? ['#1a1a1a', '#2d2d2d'] 
              : ['#667eea', '#764ba2']
            }
            style={styles.gradientHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.welcomeTitle}>Welcome Back! 👋</Text>
            <Text style={styles.welcomeSubtitle}>
              Your authentication journey is complete
            </Text>
          </LinearGradient>
        </View>

        {/* Selfie Display Section */}
        {(user?.localSelfiePath || user?.selfieUrl) && (
          <View style={styles.selfieSection}>
            <Text style={styles.sectionTitle}>Your Profile Picture</Text>
            <View style={styles.selfieGrid}>
              <TouchableOpacity 
                style={styles.selfieGridItem}
                onPress={showSelfieModal}
                activeOpacity={0.9}
              >
                <Image 
                  source={{ uri: user.localSelfiePath || user.selfieUrl }} 
                  style={styles.selfieGridImage}
                  resizeMode="cover"
                />
                <View style={styles.selfieGridOverlay}>
                  <Text style={styles.selfieGridText}>Tap to view</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.selfieInfo}>
              <Text style={styles.selfieCaption}>Your uploaded selfie</Text>
              <Text style={styles.selfieStatus}>✓ Successfully uploaded</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.logoutButton, { borderColor: Colors[colorScheme ?? 'light'].tabIconDefault }]}
            onPress={handleLogout}
          >
            <Text style={[styles.logoutButtonText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Full Selfie Modal */}
      <Modal
        visible={showFullSelfie}
        transparent={true}
        animationType="none"
        onRequestClose={hideSelfieModal}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity 
            style={styles.modalBackground}
            onPress={hideSelfieModal}
            activeOpacity={1}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.fullSelfieContainer}
                onPress={() => {}} // Prevent closing when tapping image
                activeOpacity={1}
              >
                <Image 
                  source={{ uri: user?.localSelfiePath || user?.selfieUrl }} 
                  style={styles.fullSelfieImage}
                  resizeMode="contain"
                />
                <View style={styles.modalCloseButton}>
                  <TouchableOpacity onPress={hideSelfieModal}>
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
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
  welcomeHeader: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  gradientHeader: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  selfieSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  selfieContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  selfieFrame: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  selfieImage: {
    width: '100%',
    height: '100%',
  },
  selfieFrameBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 20,
  },
  selfieFrameShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
  },
  selfieInfo: {
    alignItems: 'center',
    marginTop: 12,
  },
  selfieCaption: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  selfieStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  actionsSection: {
    paddingHorizontal: 24,
  },
  actionButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  logoutButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalBackground: {
    flex: 1,
  },
  modalContent: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.8,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullSelfieContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullSelfieImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 24,
    color: 'white',
  },
  selfieGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  selfieGridItem: {
    width: screenWidth * 0.4, // Adjust width for 4x4 grid
    height: screenWidth * 0.4, // Adjust height for 4x4 grid
    borderRadius: 10,
    overflow: 'hidden',
    margin: 5,
    position: 'relative',
  },
  selfieGridImage: {
    width: '100%',
    height: '100%',
  },
  selfieGridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  selfieGridText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
