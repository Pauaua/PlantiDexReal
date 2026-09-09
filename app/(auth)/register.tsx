import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { RegisterForm } from '@features/auth/components/RegisterForm';

export default function RegisterScreen() {
  return (
    <View className="flex-1 justify-center bg-background px-6">
      <Text accessibilityRole="header" className="text-foreground mb-6 text-2xl font-bold">
        Crear cuenta
      </Text>
      <RegisterForm />
      <Link
        href="/(auth)/login"
        className="text-primary-400 mt-4 text-center"
        accessibilityRole="link"
      >
        ¿Ya tienes cuenta? Inicia sesión
      </Link>
    </View>
  );
}
