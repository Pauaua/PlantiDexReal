import { Tabs } from 'expo-router';

import { colors } from '@lib/theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.foregroundMuted,
        tabBarStyle: { backgroundColor: colors.backgroundElevated, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="species/index" options={{ title: 'Especies' }} />
      <Tabs.Screen name="map" options={{ title: 'Mapa' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
