import '../global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useDatabaseMigrations } from '@db/useDatabaseMigrations';
import { useAuthSessionListener } from '@features/auth/hooks/useAuthSessionListener';
import { colors } from '@lib/theme/tokens';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
});

export default function RootLayout() {
  const [client] = useState(() => queryClient);
  const { success: migrationsReady, error: migrationsError } = useDatabaseMigrations();
  useAuthSessionListener();

  if (migrationsError) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text accessibilityRole="alert" className="text-danger text-center">
          No pudimos preparar la base de datos local: {migrationsError.message}
        </Text>
      </View>
    );
  }

  if (!migrationsReady) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} accessibilityLabel="Preparando base de datos" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={client}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
