import { forwardRef } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';

import { colors } from '@lib/theme/tokens';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, error, ...inputProps }, ref) => {
    return (
      <View className="mb-4">
        <Text className="text-foreground-muted mb-1 text-sm">{label}</Text>
        <TextInput
          ref={ref}
          accessibilityLabel={error ? `${label}. ${error}` : label}
          placeholderTextColor={colors.foregroundMuted}
          className={`text-foreground bg-background-elevated rounded-md border px-3 py-2 ${
            error ? 'border-danger' : 'border-border'
          }`}
          {...inputProps}
        />
        {error ? (
          <Text
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            className="text-danger mt-1 text-xs"
          >
            {error}
          </Text>
        ) : null}
      </View>
    );
  },
);

TextField.displayName = 'TextField';
