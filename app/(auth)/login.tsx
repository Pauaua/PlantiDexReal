import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { LoginForm } from '@features/auth/components/LoginForm';

export default function LoginScreen() {
  return (
    <View className="flex-1 justify-center bg-background px-6">
      <Text accessibilityRole="header" className="text-foreground mb-6 text-2xl font-bold">
        Plantidex
      </Text>
      <LoginForm />
      <Link
        href="/(auth)/register"
        className="text-primary-400 mt-4 text-center"
        accessibilityRole="link"
      >
        ¿No tienes cuenta? Crea una
      </Link>
    </View>
  );
}
