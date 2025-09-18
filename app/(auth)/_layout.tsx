import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAbstraxionAccount } from '@burnt-labs/abstraxion-react-native';

export default function AuthLayout() {
  const abstraxionAccount = useAbstraxionAccount();
  const { isConnected } = abstraxionAccount || {};

  // If wallet is connected, do not show auth stack; go to tabs home
  if (isConnected) {
    return <Redirect href="/(tabs)/home" />;
  }

  // Auth-only stack (no tab bar)
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    />
  );
}
