import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import ClusteredMapView from 'react-native-map-clustering';
import MapView, { Marker, type Region } from 'react-native-maps';

import { Button } from '@components/ui/Button';
import { getConservationStatusLabel } from '@features/species/constants';
import { useLocationCapture } from '@features/species/hooks/useLocationCapture';
import { colors } from '@lib/theme/tokens';

import { useCommunityReports, type MapCenter } from '../hooks/useCommunityReports';

// Falls back to Santiago, Chile when location permission is denied/blocked.
const DEFAULT_CENTER: MapCenter = { latitude: -33.4489, longitude: -70.6693 };

export function CommunityMap() {
  const { status: locationStatus, coordinates, capture } = useLocationCapture();
  const mapRef = useRef<MapView | null>(null);
  const hasAnimatedToUser = useRef(false);

  const [searchCenter, setSearchCenter] = useState<MapCenter | null>(null);
  const [pendingRegion, setPendingRegion] = useState<MapCenter | null>(null);

  useEffect(() => {
    void capture();
  }, [capture]);

  useEffect(() => {
    if (coordinates && !hasAnimatedToUser.current) {
      hasAnimatedToUser.current = true;
      mapRef.current?.animateToRegion(
        { ...coordinates, latitudeDelta: 0.5, longitudeDelta: 0.5 },
        500,
      );
    }
  }, [coordinates]);

  const effectiveCenter = searchCenter ?? coordinates ?? DEFAULT_CENTER;
  const { data: reports, isLoading, isError } = useCommunityReports(effectiveCenter);

  const handleRegionChangeComplete = (region: Region) => {
    setPendingRegion({ latitude: region.latitude, longitude: region.longitude });
  };

  const handleSearchArea = () => {
    setSearchCenter(pendingRegion ?? effectiveCenter);
  };

  return (
    <View className="flex-1 bg-background">
      <ClusteredMapView
        mapRef={(ref) => {
          mapRef.current = ref as unknown as MapView | null;
        }}
        style={{ flex: 1 }}
        initialRegion={{ ...DEFAULT_CENTER, latitudeDelta: 0.5, longitudeDelta: 0.5 }}
        onRegionChangeComplete={handleRegionChangeComplete}
        clusterColor={colors.primary}
        clusterTextColor="#FFFFFF"
      >
        {(reports ?? []).map((report) => (
          <Marker
            key={report.id}
            coordinate={{ latitude: report.latitude, longitude: report.longitude }}
            title={report.commonName}
            description={`${report.scientificName} · ${getConservationStatusLabel(report.conservationStatus)}`}
            accessibilityLabel={`Reporte de ${report.commonName}, ${report.scientificName}`}
          />
        ))}
      </ClusteredMapView>

      <View className="absolute bottom-6 left-6 right-6">
        <Button label="Buscar en esta zona" variant="secondary" onPress={handleSearchArea} />
      </View>

      {locationStatus === 'denied' || locationStatus === 'blocked' ? (
        <View className="rounded-card bg-background-elevated border-border absolute left-6 right-6 top-6 border p-3">
          <Text accessibilityRole="alert" className="text-danger text-xs">
            No pudimos usar tu ubicación; mostrando el mapa centrado en Chile.
          </Text>
        </View>
      ) : null}

      {isLoading ? (
        <View className="absolute right-6 top-6">
          <ActivityIndicator color={colors.primary} accessibilityLabel="Cargando reportes" />
        </View>
      ) : null}

      {isError ? (
        <View className="rounded-card bg-background-elevated border-border absolute left-6 right-6 top-6 border p-3">
          <Text accessibilityRole="alert" className="text-danger text-xs">
            No pudimos cargar los reportes comunitarios.
          </Text>
        </View>
      ) : null}
    </View>
  );
}
