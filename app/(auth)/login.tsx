import { View, Text } from 'react-native';

export default function LoginScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background" accessibilityRole="none">
      <Text className="text-foreground text-xl font-semibold" accessibilityRole="header">
        Iniciar sesión (próximamente)
      </Text>
    </View>
  );
}
