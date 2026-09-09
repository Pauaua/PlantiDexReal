import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

export default function SpeciesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 items-center justify-center bg-background" accessibilityRole="none">
      <Text className="text-foreground text-xl font-semibold" accessibilityRole="header">
        Detalle de especie {id} (próximamente)
      </Text>
    </View>
  );
}
