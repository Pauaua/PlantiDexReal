import { and, desc, eq, isNull } from 'drizzle-orm';

import type { Database } from '@db/client';
import { species, type ConservationStatus, type SpeciesRow } from '@db/schema';
import { generateId } from '@lib/id';

export interface CreateSpeciesInput {
  commonName: string;
  scientificName: string;
  description?: string;
  conservationStatus: ConservationStatus;
  latitude: number;
  longitude: number;
  photoLocalUri?: string;
  authorId?: string;
}

export type UpdateSpeciesInput = Partial<
  Omit<CreateSpeciesInput, 'authorId'> & { photoRemoteUrl: string }
>;

export function createLocalSpeciesStore(database: Database) {
  return {
    async listAll(): Promise<SpeciesRow[]> {
      return database
        .select()
        .from(species)
        .where(isNull(species.deletedAt))
        .orderBy(desc(species.createdAt));
    },

    async getById(id: string): Promise<SpeciesRow | undefined> {
      const [row] = await database
        .select()
        .from(species)
        .where(and(eq(species.id, id), isNull(species.deletedAt)));
      return row;
    },

    async create(input: CreateSpeciesInput): Promise<SpeciesRow> {
      const now = Date.now();
      const [row] = await database
        .insert(species)
        .values({
          id: generateId(),
          commonName: input.commonName,
          scientificName: input.scientificName,
          description: input.description,
          conservationStatus: input.conservationStatus,
          latitude: input.latitude,
          longitude: input.longitude,
          photoLocalUri: input.photoLocalUri,
          authorId: input.authorId,
          createdAt: now,
          updatedAt: now,
          syncStatus: 'pending',
        })
        .returning();

      if (!row) throw new Error('Failed to create species');
      return row;
    },

    async update(id: string, patch: UpdateSpeciesInput): Promise<SpeciesRow> {
      const [row] = await database
        .update(species)
        .set({ ...patch, updatedAt: Date.now(), syncStatus: 'pending' })
        .where(eq(species.id, id))
        .returning();

      if (!row) throw new Error(`Species ${id} not found`);
      return row;
    },

    async softDelete(id: string): Promise<void> {
      await database
        .update(species)
        .set({ deletedAt: Date.now(), syncStatus: 'pending' })
        .where(eq(species.id, id));
    },

    async markSynced(id: string, remotePhotoUrl?: string): Promise<void> {
      await database
        .update(species)
        .set({ syncStatus: 'synced', lastSyncError: null, photoRemoteUrl: remotePhotoUrl })
        .where(eq(species.id, id));
    },

    async markSyncError(id: string, errorMessage: string): Promise<void> {
      await database
        .update(species)
        .set({ syncStatus: 'error', lastSyncError: errorMessage })
        .where(eq(species.id, id));
    },
  };
}

export type LocalSpeciesStore = ReturnType<typeof createLocalSpeciesStore>;
