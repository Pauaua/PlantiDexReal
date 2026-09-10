import { z } from 'zod';

import { CONSERVATION_STATUSES, type ConservationStatus } from '@db/schema';

const conservationStatusTuple = CONSERVATION_STATUSES as unknown as [
  ConservationStatus,
  ...ConservationStatus[],
];

export const speciesFormSchema = z
  .object({
    commonName: z.string().min(2, 'Ingresa el nombre común'),
    scientificName: z.string().min(2, 'Ingresa el nombre científico'),
    description: z.string().optional(),
    conservationStatus: z.enum(conservationStatusTuple, {
      message: 'Selecciona un estado de conservación',
    }),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    photoLocalUri: z.string().nullable(),
  })
  .refine((data) => data.latitude !== null && data.longitude !== null, {
    message: 'Captura la ubicación de la especie',
    path: ['latitude'],
  })
  .refine((data) => Boolean(data.photoLocalUri), {
    message: 'Toma una foto de la especie',
    path: ['photoLocalUri'],
  });

export type SpeciesFormValues = z.infer<typeof speciesFormSchema>;
