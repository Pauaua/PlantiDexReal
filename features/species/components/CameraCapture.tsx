import { CameraView } from 'expo-camera';
import { useRef, useState } from 'react';
import { Image, Linking, Text, View } from 'react-native';

import { Button } from '@components/ui/Button';
import { requestCameraPermission } from '@lib/permissions/camera';

interface CameraCaptureProps {
  photoUri: string | null;
  onCapture: (uri: string) => void;
  error?: string;
}

type PermissionState = 'idle' | 'denied' | 'blocked';

export function CameraCapture({ photoUri, onCapture, error }: CameraCaptureProps) {
  const cameraRef = useRef<CameraView>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState>('idle');

  const handleOpenCamera = async () => {
    const permission = await requestCameraPermission();
    if (!permission.granted) {
      setPermissionState(permission.canAskAgain ? 'denied' : 'blocked');
      return;
    }
    setPermissionState('idle');
    setIsCameraOpen(true);
  };

  const handleCapture = async () => {
    const picture = await cameraRef.current?.takePictureAsync({ quality: 0.6 });
    if (picture?.uri) {
      onCapture(picture.uri);
      setIsCameraOpen(false);
    }
  };

  if (isCameraOpen) {
    return (
      <View className="rounded-card mb-4 h-72 overflow-hidden">
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
        <View className="absolute bottom-3 w-full flex-row justify-center px-4">
          <Button label="Capturar foto" onPress={handleCapture} />
        </View>
      </View>
    );
  }

  return (
    <View className="mb-4">
      <Text className="text-foreground-muted mb-1 text-sm">Foto de la especie</Text>
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          accessibilityIgnoresInvertColors
          accessibilityLabel="Foto capturada de la especie"
          className="rounded-card mb-2 h-40 w-full"
        />
      ) : null}
      <Button
        label={photoUri ? 'Volver a tomar foto' : 'Tomar foto'}
        variant="secondary"
        onPress={handleOpenCamera}
      />
      {permissionState !== 'idle' ? (
        <View className="mt-2">
          <Text
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            className="text-danger text-xs"
          >
            {permissionState === 'blocked'
              ? 'El acceso a la cámara está bloqueado. Actívalo desde los ajustes del sistema para poder fotografiar la especie.'
              : 'Necesitamos acceso a la cámara para fotografiar la especie.'}
          </Text>
          {permissionState === 'blocked' ? (
            <Button
              label="Abrir ajustes"
              variant="secondary"
              onPress={() => {
                void Linking.openSettings();
              }}
            />
          ) : null}
        </View>
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
