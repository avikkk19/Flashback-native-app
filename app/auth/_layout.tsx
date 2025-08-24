import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="phone"
        options={{
          title: 'Phone Number',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="otp"
        options={{
          title: 'Verify OTP',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="liveness"
        options={{
          title: 'Liveness Check',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="selfie"
        options={{
          title: 'Selfie Capture',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
