import { Pressable, Text, View } from 'react-native';

import { CONSERVATION_STATUSES, type ConservationStatus } from '@db/schema';

const LABELS: Record<ConservationStatus, string> = {
  least_concern: 'Preocupación menor',
  near_threatened: 'Casi amenazada',
  vulnerable: 'Vulnerable',
  endangered: 'En peligro',
  critically_endangered: 'En peligro crítico',
  extinct_in_the_wild: 'Extinta en estado salvaje',
  unknown: 'Desconocido',
};

interface ConservationStatusPickerProps {
  value: ConservationStatus | undefined;
  onChange: (value: ConservationStatus) => void;
  error?: string;
}

export function ConservationStatusPicker({
  value,
  onChange,
  error,
}: ConservationStatusPickerProps) {
  return (
    <View className="mb-4">
      <Text className="text-foreground-muted mb-1 text-sm">Estado de conservación</Text>
      <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">
        {CONSERVATION_STATUSES.map((status) => {
          const selected = value === status;
          return (
            <Pressable
              key={status}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={LABELS[status]}
              onPress={() => onChange(status)}
              className={`rounded-full border px-3 py-2 ${
                selected
                  ? 'bg-primary-500 border-primary-500'
                  : 'border-border bg-background-elevated'
              }`}
            >
              <Text
                className={selected ? 'text-xs font-medium text-white' : 'text-foreground text-xs'}
              >
                {LABELS[status]}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
