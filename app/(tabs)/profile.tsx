import { Text, View } from 'react-native';

import { Button } from '@components/ui/Button';
import { useSession } from '@features/auth/hooks/useSession';
import { useSignOut } from '@features/auth/hooks/useSignOut';

export default function ProfileScreen() {
  const { user } = useSession();
  const signOut = useSignOut();

  return (
    <View className="flex-1 justify-center bg-background px-6">
      <Text accessibilityRole="header" className="text-foreground mb-2 text-2xl font-bold">
        Perfil
      </Text>
      <Text className="text-foreground-muted mb-8">{user?.email}</Text>
      {signOut.isError ? (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          className="text-danger mb-3 text-sm"
        >
          No pudimos cerrar tu sesión. Intenta de nuevo.
        </Text>
      ) : null}
      <Button
        label="Cerrar sesión"
        variant="secondary"
        loading={signOut.isPending}
        onPress={() => signOut.mutate()}
      />
    </View>
  );
}
