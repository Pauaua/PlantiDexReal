import { ScrollView, Text } from 'react-native';

import { SpeciesForm } from '@features/species/components/SpeciesForm';

export default function NewSpeciesScreen() {
  return (
    <ScrollView
      className="flex-1 bg-background px-6 pt-6"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text accessibilityRole="header" className="text-foreground mb-6 text-2xl font-bold">
        Registrar especie
      </Text>
      <SpeciesForm />
    </ScrollView>
  );
}
