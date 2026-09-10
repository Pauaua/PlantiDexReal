import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';

import { SpeciesForm } from '@features/species/components/SpeciesForm';

export default function NewSpeciesScreen() {
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="px-6 pt-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text accessibilityRole="header" className="text-foreground mb-6 text-2xl font-bold">
          Registrar especie
        </Text>
        <SpeciesForm />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
