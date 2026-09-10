import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function SpeciesListScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text accessibilityRole="header" className="text-foreground mb-4 text-xl font-semibold">
        Especies registradas (próximamente)
      </Text>
      <Link
        href="/(tabs)/species/new"
        className="text-primary-400"
        accessibilityRole="link"
        accessibilityLabel="Registrar una nueva especie"
      >
        + Registrar especie
      </Link>
    </View>
  );
}
