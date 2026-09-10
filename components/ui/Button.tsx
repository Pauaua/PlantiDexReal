import { ActivityIndicator, Pressable, type PressableProps, Text } from 'react-native';

import { colors } from '@lib/theme/tokens';

interface ButtonProps extends PressableProps {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

export function Button({
  label,
  loading = false,
  variant = 'primary',
  disabled,
  ...pressableProps
}: ButtonProps) {
  const isDisabled = Boolean(disabled) || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={`items-center justify-center rounded-md py-3 ${
        variant === 'primary' ? 'bg-primary-500' : 'border-border bg-background-elevated border'
      } ${isDisabled ? 'opacity-60' : ''}`}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.foreground : colors.primary}
          accessibilityLabel={`${label}, cargando`}
        />
      ) : (
        <Text
          className={`font-semibold ${variant === 'primary' ? 'text-white' : 'text-foreground'}`}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
