import { useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, Text, View } from 'react-native';

import { getConservationStatusLabel } from '@features/species/constants';
import { useSpeciesDetail } from '@features/species/hooks/useSpeciesDetail';

const SYNC_STATUS_LABELS: Record<string, string> = {
  synced: 'Sincronizado',
  pending: 'Pendiente de sincronizar',
  error: 'Error al sincronizar',
};

export default function SpeciesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: speciesItem, isLoading, isError } = useSpeciesDetail(id);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text accessibilityLiveRegion="polite" className="text-foreground-muted">
          Cargando especie…
        </Text>
      </View>
    );
  }

  if (isError || !speciesItem) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text accessibilityRole="alert" className="text-danger text-center">
          No encontramos esta especie.
        </Text>
      </View>
    );
  }

  const syncLabel = SYNC_STATUS_LABELS[speciesItem.syncStatus] ?? speciesItem.syncStatus;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 40 }}>
      {speciesItem.photoLocalUri ? (
        <Image
          source={{ uri: speciesItem.photoLocalUri }}
          accessibilityLabel={`Foto de ${speciesItem.commonName}`}
          className="h-64 w-full"
        />
      ) : null}
      <View className="px-6 pt-6">
        <Text accessibilityRole="header" className="text-foreground text-2xl font-bold">
          {speciesItem.commonName}
        </Text>
        <Text className="text-foreground-muted mb-4 text-base italic">
          {speciesItem.scientificName}
        </Text>

        <Text className="text-foreground-muted mb-1 text-sm">Estado de conservación</Text>
        <Text className="text-foreground mb-4">
          {getConservationStatusLabel(speciesItem.conservationStatus)}
        </Text>

        {speciesItem.description ? (
          <>
            <Text className="text-foreground-muted mb-1 text-sm">Descripción</Text>
            <Text className="text-foreground mb-4">{speciesItem.description}</Text>
          </>
        ) : null}

        <Text className="text-foreground-muted mb-1 text-sm">Ubicación</Text>
        <Text className="text-foreground mb-4">
          {speciesItem.latitude.toFixed(5)}, {speciesItem.longitude.toFixed(5)}
        </Text>

        <Text accessibilityLabel={syncLabel} className="text-foreground-muted text-xs">
          {syncLabel}
        </Text>
      </View>
    </ScrollView>
  );
}
