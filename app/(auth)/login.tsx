import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { LoginForm } from '@features/auth/components/LoginForm';

export default function LoginScreen() {
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
