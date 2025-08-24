import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
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

import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { user, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFullImageModal, setShowFullImageModal] = useState(false);

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
      
      {/* User Profile Card */}
      <View style={styles.userProfileCard}>
        <LinearGradient
          colors={colorScheme === 'dark' 
            ? ['#2c3e50', '#34495e'] 
            : ['#3498db', '#2980b9']
          }
          style={styles.profileCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.profileCardContent}>
            <View style={styles.profileInfo}>
              <TouchableOpacity onPress={() => setShowProfileModal(true)}>
                <Text style={styles.profilePhone}>{user?.phoneNumber || '+91 98765 43210'}</Text>
              </TouchableOpacity>
              <Text style={styles.profileStatus}>✓ Verified User</Text>
              <Text style={styles.profileWelcome}>Welcome to Flashback</Text>
            </View>
            {user?.localSelfiePath || user?.selfieUrl ? (
              <TouchableOpacity onPress={() => setShowFullImageModal(true)}>
                <Image 
                  source={{ uri: user.localSelfiePath || user.selfieUrl }} 
                  style={styles.profileAvatar}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.profileAvatarPlaceholder}>
                <Text style={styles.profileAvatarText}>👤</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >






      </ScrollView>

      {/* Profile Modal */}
      <Modal
        visible={showProfileModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowProfileModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalProfileSection}>
              {user?.localSelfiePath || user?.selfieUrl ? (
                <Image 
                  source={{ uri: user.localSelfiePath || user.selfieUrl }} 
                  style={styles.modalProfileAvatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.modalProfileAvatarPlaceholder}>
                  <Text style={styles.modalProfileAvatarText}>👤</Text>
                </View>
              )}
              <Text style={styles.modalProfilePhone}>{user?.phoneNumber || '+91 98765 43210'}</Text>
              <Text style={styles.modalProfileStatus}>✓ Verified User</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalLogoutButton}
                onPress={() => {
                  setShowProfileModal(false);
                  handleLogout();
                }}
              >
                <Text style={styles.modalLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Full Image Modal */}
      <Modal
        visible={showFullImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullImageModal(false)}
      >
        <View style={styles.fullImageModalOverlay}>
          <TouchableOpacity 
            style={styles.fullImageModalBackground}
            onPress={() => setShowFullImageModal(false)}
            activeOpacity={1}
          >
            <View style={styles.fullImageModalContent}>
              <TouchableOpacity 
                style={styles.fullImageContainer}
                onPress={() => {}} // Prevent closing when tapping image
                activeOpacity={1}
              >
                <Image 
                  source={{ uri: user?.localSelfiePath || user?.selfieUrl }} 
                  style={styles.fullImage}
                  resizeMode="contain"
                />
                <TouchableOpacity 
                  style={styles.fullImageCloseButton}
                  onPress={() => setShowFullImageModal(false)}
                >
                  <Text style={styles.fullImageCloseText}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userProfileCard: {
    height: 120,
    marginBottom: 20,
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  profileCardGradient: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  profileCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profilePhone: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
    textDecorationLine: 'underline',
  },
  profileStatus: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  profileWelcome: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  profileAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  profileAvatarText: {
    fontSize: 32,
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },



  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  modalProfileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  modalProfileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#3498db',
    marginBottom: 16,
  },
  modalProfileAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#3498db',
    marginBottom: 16,
  },
  modalProfileAvatarText: {
    fontSize: 40,
    color: '#666',
  },
  modalProfilePhone: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalProfileStatus: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 24,
  },
  modalActions: {
    paddingHorizontal: 24,
  },
  modalLogoutButton: {
    backgroundColor: '#f44336',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLogoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Full Image Modal Styles
  fullImageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImageModalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImageModalContent: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  fullImageCloseButton: {
    position: 'absolute',
    top: 60,
    right: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  fullImageCloseText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
