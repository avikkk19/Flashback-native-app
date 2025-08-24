import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

// Component to handle navigation based on auth state
function RootLayoutNav() {
  const { isAuthenticated, isLoading, livenessCompleted } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log('[NAV] Layout effect triggered:', { isAuthenticated, livenessCompleted, segments, isLoading });
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const currentScreen = segments[segments.length - 1];

    console.log('[NAV] Auth state:', { isAuthenticated, livenessCompleted, inAuthGroup, currentScreen });

    if (!isAuthenticated && !inAuthGroup) {
      // Not authenticated, go to phone screen
      console.log('[NAV] Redirecting to phone screen');
      router.replace('/auth/phone');
    } else if (isAuthenticated && !livenessCompleted) {
      // Authenticated but liveness not completed, go to liveness
      if (currentScreen !== 'liveness') {
        console.log('[NAV] Redirecting to liveness screen');
        router.replace('/auth/liveness');
      }
    } else if (isAuthenticated && livenessCompleted && inAuthGroup) {
      // Authenticated and liveness completed, go to home
      console.log('[NAV] Redirecting to home screen');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, livenessCompleted, segments, isLoading]);

  return (
    <Stack>
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
