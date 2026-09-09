import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: reemplazar por chequeo real de sesión (useAuth) en el paso de autenticación.
  return <Redirect href="/(auth)/login" />;
}
