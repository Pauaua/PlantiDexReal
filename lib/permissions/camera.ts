import { Camera } from 'expo-camera';

export interface PermissionOutcome {
  granted: boolean;
  canAskAgain: boolean;
}

export async function requestCameraPermission(): Promise<PermissionOutcome> {
  const response = await Camera.requestCameraPermissionsAsync();
  return { granted: response.granted, canAskAgain: response.canAskAgain };
}
