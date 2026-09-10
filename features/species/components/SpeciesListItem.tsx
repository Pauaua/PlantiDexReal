import { Link } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';

import type { SpeciesRow } from '@db/schema';

import { getConservationStatusLabel } from '../constants';

interface SpeciesListItemProps {
  species: SpeciesRow;
}

export function SpeciesListItem({ species }: SpeciesListItemProps) {
  return (
    <Link href={`/(tabs)/species/${species.id}`} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${species.commonName}, ${species.scientificName}`}
        className="rounded-card bg-background-elevated border-border flex-row items-center gap-3 border p-3"
      >
        {species.photoLocalUri ? (
          <Image
            source={{ uri: species.photoLocalUri }}
            accessibilityIgnoresInvertColors
            className="h-16 w-16 rounded-md"
          />
        ) : (
          <View className="bg-background h-16 w-16 rounded-md" />
        )}
        <View className="flex-1">
          <Text className="text-foreground font-semibold">{species.commonName}</Text>
          <Text className="text-foreground-muted text-sm italic">{species.scientificName}</Text>
          <Text className="text-foreground-muted text-xs">
            {getConservationStatusLabel(species.conservationStatus)}
          </Text>
        </View>
        {species.syncStatus === 'pending' ? (
          <Text accessibilityLabel="Pendiente de sincronizar" className="text-warning text-xs">
            Pendiente
          </Text>
        ) : null}
      </Pressable>
    </Link>
  );
}
