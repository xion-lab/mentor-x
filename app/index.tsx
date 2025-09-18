import React from 'react';
import { Redirect } from 'expo-router';
import { useAbstraxionAccount } from '@burnt-labs/abstraxion-react-native';

export default function Index() {
  const abstraxionAccount = useAbstraxionAccount();
  const { isConnected } = abstraxionAccount || {};

  // Default: if not connected or first entry -> go to welcome (auth stack)
  // When connected -> go to tabs home
  return isConnected ? (
    <Redirect href="/(tabs)/home" />
  ) : (
    <Redirect href="/(auth)/welcome" />
  );
}
