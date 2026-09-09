import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';

import { Button } from '@components/ui/Button';
import { TextField } from '@components/ui/TextField';

import { useSignIn } from '../hooks/useSignIn';
import { loginSchema, type LoginFormValues } from '../schemas/authSchemas';

export function LoginForm() {
  const router = useRouter();
  const signIn = useSignIn();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit((values) => {
    signIn.mutate(values, {
      onSuccess: () => router.replace('/(tabs)/species'),
    });
  });

  return (
    <View>
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
            autoComplete="password"
            error={errors.password?.message}
          />
        )}
      />
      {signIn.isError ? (
        <Text accessibilityRole="alert" className="text-danger mb-3 text-sm">
          No pudimos iniciar sesión. Verifica tu correo y contraseña.
        </Text>
      ) : null}
      <Button label="Iniciar sesión" onPress={onSubmit} loading={signIn.isPending} />
    </View>
  );
}
