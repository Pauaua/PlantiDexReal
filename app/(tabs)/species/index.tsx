import { Link } from 'expo-router';
import { FlatList, Text, View } from 'react-native';

import { SpeciesListItem } from '@features/species/components/SpeciesListItem';
import { useSpeciesList } from '@features/species/hooks/useSpeciesList';

export default function SpeciesListScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useSpeciesList();

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-6 pb-2 pt-6">
        <Text accessibilityRole="header" className="text-foreground text-2xl font-bold">
          Especies
        </Text>
        <Link
          href="/(tabs)/species/new"
          accessibilityRole="link"
          accessibilityLabel="Registrar una nueva especie"
          className="text-primary-400 font-semibold"
        >
          + Nueva
        </Link>
      </View>

      {isLoading ? (
        <Text accessibilityLiveRegion="polite" className="text-foreground-muted px-6">
          Cargando especies…
        </Text>
      ) : isError ? (
        <Text accessibilityRole="alert" className="text-danger px-6">
          No pudimos cargar las especies registradas.
        </Text>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, gap: 12 }}
          onRefresh={() => {
            void refetch();
          }}
          refreshing={isRefetching}
          renderItem={({ item }) => <SpeciesListItem species={item} />}
          ListEmptyComponent={
            <Text className="text-foreground-muted mt-8 text-center">
              Aún no registras ninguna especie.
            </Text>
          }
        />
      )}
    </View>
  );
}
