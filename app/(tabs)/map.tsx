import { View, Text } from 'react-native';

export default function MapScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background" accessibilityRole="none">
      <Text className="text-foreground text-xl font-semibold" accessibilityRole="header">
        Mapa comunitario (próximamente)
      </Text>
    </View>
  );
}
