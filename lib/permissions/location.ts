import * as Location from 'expo-location';

export interface PermissionOutcome {
  granted: boolean;
  canAskAgain: boolean;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export async function requestLocationPermission(): Promise<PermissionOutcome> {
  const response = await Location.requestForegroundPermissionsAsync();
  return { granted: response.granted, canAskAgain: response.canAskAgain };
}

export async function getCurrentCoordinates(): Promise<Coordinates> {
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return { latitude: position.coords.latitude, longitude: position.coords.longitude };
}
