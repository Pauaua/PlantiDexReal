import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@components/ui/Button';

import { useLocationCapture } from '../hooks/useLocationCapture';

interface LocationCaptureProps {
  onCapture: (coords: { latitude: number; longitude: number }) => void;
  error?: string;
}

export function LocationCapture({ onCapture, error }: LocationCaptureProps) {
  const { status, coordinates, errorMessage, capture } = useLocationCapture();

  useEffect(() => {
    if (coordinates) onCapture(coordinates);
  }, [coordinates, onCapture]);

  return (
    <View className="mb-4">
      <Text className="text-foreground-muted mb-1 text-sm">Ubicación</Text>
      {coordinates ? (
        <Text className="text-foreground mb-2 text-sm">
          {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}
        </Text>
      ) : null}
      <Button
        label={coordinates ? 'Actualizar ubicación' : 'Usar mi ubicación actual'}
        variant="secondary"
        loading={status === 'loading'}
        onPress={() => {
          void capture();
        }}
      />
      {status === 'denied' || status === 'blocked' ? (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          className="text-danger mt-2 text-xs"
        >
          {status === 'blocked'
            ? 'El acceso a tu ubicación está bloqueado. Actívalo desde los ajustes del sistema.'
            : 'Necesitamos tu ubicación para geolocalizar el reporte de esta especie.'}
        </Text>
      ) : null}
      {status === 'error' && errorMessage ? (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          className="text-danger mt-2 text-xs"
        >
          {errorMessage}
        </Text>
      ) : null}
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
}
