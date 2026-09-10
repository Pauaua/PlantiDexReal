import type { LocalSpeciesStore } from '@features/species/services/localSpeciesStore';
import {
  remoteSpeciesApi,
  type RemoteSpeciesApi,
} from '@features/species/services/remoteSpeciesApi';

import type { SyncQueueStore } from './syncQueue';

interface SpeciesSyncPayload {
  id: string;
  commonName: string;
  scientificName: string;
  description: string | null;
  conservationStatus: string;
  latitude: number;
  longitude: number;
  photoLocalUri: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface SyncResult {
  processed: number;
  failed: number;
}

/**
 * Drains the local sync_queue, pushing each pending species change to
 * Supabase. Runs with "last write wins": every upsert simply overwrites the
 * remote row with the local version's timestamp, no merge logic — good
 * enough since a single author edits their own reports from one place at a
 * time. Failures stay queued with an incremented attempt count for retry.
 */
export function createSyncEngine(
  queue: SyncQueueStore,
  localStore: LocalSpeciesStore,
  remoteApi: RemoteSpeciesApi = remoteSpeciesApi,
) {
  return {
    async processPending(): Promise<SyncResult> {
      const pending = await queue.listPending();
      let processed = 0;
      let failed = 0;

      for (const item of pending) {
        if (item.entityType !== 'species') {
          await queue.remove(item.id);
          continue;
        }

        try {
          if (item.operation === 'delete') {
            await remoteApi.softDelete(item.entityId);
          } else {
            const payload = JSON.parse(item.payload) as SpeciesSyncPayload;

            const photoUrl = payload.photoLocalUri
              ? await remoteApi.uploadPhoto(payload.photoLocalUri, `${payload.id}.jpg`)
              : null;

            await remoteApi.upsert({
              id: payload.id,
              commonName: payload.commonName,
              scientificName: payload.scientificName,
              description: payload.description,
              conservationStatus: payload.conservationStatus,
              latitude: payload.latitude,
              longitude: payload.longitude,
              photoUrl,
              createdAt: payload.createdAt,
              updatedAt: payload.updatedAt,
            });

            await localStore.markSynced(item.entityId, photoUrl ?? undefined);
          }

          await queue.remove(item.id);
          processed += 1;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error de sincronización';
          await queue.recordFailure(item.id, message);
          if (item.operation !== 'delete') {
            await localStore.markSyncError(item.entityId, message);
          }
          failed += 1;
        }
      }

      return { processed, failed };
    },
  };
}

export type SyncEngine = ReturnType<typeof createSyncEngine>;
