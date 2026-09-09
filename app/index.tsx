import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useSession } from '@features/auth/hooks/useSession';
import { colors } from '@lib/theme/tokens';

export default function Index() {
  const { session, status } = useSession();

  if (status === 'idle') {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} accessibilityLabel="Cargando sesión" />
      </View>
    );
  }

  return <Redirect href={session ? '/(tabs)/species' : '/(auth)/login'} />;
}
