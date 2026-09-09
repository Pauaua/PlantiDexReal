import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';

import { Button } from '@components/ui/Button';
import { TextField } from '@components/ui/TextField';

import { useSignUp } from '../hooks/useSignUp';
import { registerSchema, type RegisterFormValues } from '../schemas/authSchemas';

export function RegisterForm() {
  const router = useRouter();
  const signUp = useSignUp();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit((values) => {
    signUp.mutate(values, {
      onSuccess: () => router.replace('/(tabs)/species'),
    });
  });

  return (
    <View>
      <Controller
        control={control}
        name="displayName"
        render={({ field }) => (
          <TextField
            label="Nombre"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            autoComplete="name"
            error={errors.displayName?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <TextField
            label="Correo electrónico"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            error={errors.email?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <TextField
            label="Contraseña"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            secureTextEntry
            autoComplete="password-new"
            error={errors.password?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <TextField
            label="Confirma tu contraseña"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            secureTextEntry
            error={errors.confirmPassword?.message}
          />
        )}
      />
      {signUp.isError ? (
        <Text accessibilityRole="alert" className="text-danger mb-3 text-sm">
          No pudimos crear tu cuenta. Intenta de nuevo.
        </Text>
      ) : null}
      <Button label="Crear cuenta" onPress={onSubmit} loading={signUp.isPending} />
    </View>
  );
}
