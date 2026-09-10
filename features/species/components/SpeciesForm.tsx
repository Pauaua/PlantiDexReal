import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';

import { Button } from '@components/ui/Button';
import { TextField } from '@components/ui/TextField';
import { useSession } from '@features/auth/hooks/useSession';

import { useCreateSpecies } from '../hooks/useCreateSpecies';
import { speciesFormSchema, type SpeciesFormValues } from '../schemas/speciesSchemas';
import { CameraCapture } from './CameraCapture';
import { ConservationStatusPicker } from './ConservationStatusPicker';
import { LocationCapture } from './LocationCapture';

export function SpeciesForm() {
  const router = useRouter();
  const { user } = useSession();
  const createSpecies = useCreateSpecies();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SpeciesFormValues>({
    resolver: zodResolver(speciesFormSchema),
    defaultValues: {
      commonName: '',
      scientificName: '',
      description: '',
      conservationStatus: undefined,
      latitude: null,
      longitude: null,
      photoLocalUri: null,
    },
  });

  const onSubmit = handleSubmit((values) => {
    createSpecies.mutate(
      {
        commonName: values.commonName,
        scientificName: values.scientificName,
        description: values.description,
        conservationStatus: values.conservationStatus,
        latitude: values.latitude as number,
        longitude: values.longitude as number,
        photoLocalUri: values.photoLocalUri as string,
        authorId: user?.id,
      },
      {
        onSuccess: () => router.replace('/(tabs)/species'),
      },
    );
  });

  return (
    <View>
      <Controller
        control={control}
        name="commonName"
        render={({ field }) => (
          <TextField
            label="Nombre común"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.commonName?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="scientificName"
        render={({ field }) => (
          <TextField
            label="Nombre científico"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            autoCapitalize="none"
            error={errors.scientificName?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <TextField
            label="Descripción"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            multiline
            numberOfLines={4}
            error={errors.description?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="conservationStatus"
        render={({ field }) => (
          <ConservationStatusPicker
            value={field.value}
            onChange={field.onChange}
            error={errors.conservationStatus?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="photoLocalUri"
        render={({ field }) => (
          <CameraCapture
            photoUri={field.value}
            onCapture={field.onChange}
            error={errors.photoLocalUri?.message}
          />
        )}
      />
      <LocationCapture
        onCapture={(coords) => {
          setValue('latitude', coords.latitude, { shouldValidate: true });
          setValue('longitude', coords.longitude, { shouldValidate: true });
        }}
        error={errors.latitude?.message ?? errors.longitude?.message}
      />
      {createSpecies.isError ? (
        <Text accessibilityRole="alert" className="text-danger mb-3 text-sm">
          No pudimos guardar la especie localmente. Intenta de nuevo.
        </Text>
      ) : null}
      <Button label="Guardar especie" onPress={onSubmit} loading={createSpecies.isPending} />
    </View>
  );
}
