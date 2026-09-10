import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { RegisterForm } from '@features/auth/components/RegisterForm';

export default function RegisterScreen() {
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        className="px-6"
      >
        <View>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
