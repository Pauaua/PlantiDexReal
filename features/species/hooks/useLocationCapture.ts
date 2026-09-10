import { useCallback, useState } from 'react';

import {
  getCurrentCoordinates,
  requestLocationPermission,
  type Coordinates,
} from '@lib/permissions/location';

export type LocationCaptureStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'blocked' | 'error';

export function useLocationCapture() {
  const [status, setStatus] = useState<LocationCaptureStatus>('idle');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const capture = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);

    const permission = await requestLocationPermission();
    if (!permission.granted) {
      setStatus(permission.canAskAgain ? 'denied' : 'blocked');
      return;
    }

    try {
      const coords = await getCurrentCoordinates();
      setCoordinates(coords);
      setStatus('granted');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'No pudimos obtener tu ubicación');
    }
  }, []);

  return { status, coordinates, errorMessage, capture };
}
