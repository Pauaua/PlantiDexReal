import type { Database } from '@db/client';
import { createTestDatabase } from '@db/testDatabase';
import {
  createLocalSpeciesStore,
  type LocalSpeciesStore,
} from '@features/species/services/localSpeciesStore';
import type { RemoteSpeciesApi } from '@features/species/services/remoteSpeciesApi';

import { createSyncEngine } from '../syncEngine';
import { createSyncQueue, type SyncQueueStore } from '../syncQueue';

// syncEngine.ts falls back to the real remoteSpeciesApi as a default
// parameter, which would otherwise load @lib/supabase (and require env
// vars) even though every test here injects its own fake implementation.
jest.mock('@lib/supabase', () => ({ supabase: {} }));

function createFakeRemoteApi(): jest.Mocked<RemoteSpeciesApi> {
  return {
    uploadPhoto: jest.fn().mockResolvedValue('https://cdn.example.com/photo.jpg'),
    upsert: jest.fn().mockResolvedValue(undefined),
    softDelete: jest.fn().mockResolvedValue(undefined),
    listNearby: jest.fn().mockResolvedValue([]),
    subscribeToChanges: jest.fn().mockReturnValue(() => {}),
  };
}

describe('syncEngine', () => {
  let db: Database;
  let queue: SyncQueueStore;
  let localStore: LocalSpeciesStore;
  let remoteApi: jest.Mocked<RemoteSpeciesApi>;

  beforeEach(() => {
    db = createTestDatabase();
    queue = createSyncQueue(db);
    localStore = createLocalSpeciesStore(db);
    remoteApi = createFakeRemoteApi();
  });

  const validInput = {
    commonName: 'Copihue',
    scientificName: 'Lapageria rosea',
    conservationStatus: 'least_concern' as const,
    latitude: -39.8,
    longitude: -73.2,
    photoLocalUri: 'file:///tmp/photo.jpg',
  };

  it('pushes a pending creation, uploads its photo, and marks it synced', async () => {
    const species = await localStore.create(validInput);
    await queue.enqueue({
      entityType: 'species',
      entityId: species.id,
      operation: 'create',
      payload: { ...species },
    });

    const engine = createSyncEngine(queue, localStore, remoteApi);
    const result = await engine.processPending();

    expect(result).toEqual({ processed: 1, failed: 0 });
    expect(remoteApi.uploadPhoto).toHaveBeenCalledWith(
      'file:///tmp/photo.jpg',
      `${species.id}.jpg`,
    );
    expect(remoteApi.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: species.id, photoUrl: 'https://cdn.example.com/photo.jpg' }),
    );

    const updated = await localStore.getById(species.id);
    expect(updated?.syncStatus).toBe('synced');
    expect(updated?.photoRemoteUrl).toBe('https://cdn.example.com/photo.jpg');
    expect(await queue.listPending()).toHaveLength(0);
  });

  it('records a failure and leaves the item queued when the upsert rejects', async () => {
    const species = await localStore.create(validInput);
    await queue.enqueue({
      entityType: 'species',
      entityId: species.id,
      operation: 'create',
      payload: { ...species },
    });
    remoteApi.upsert.mockRejectedValue(new Error('network unreachable'));

    const engine = createSyncEngine(queue, localStore, remoteApi);
    const result = await engine.processPending();

    expect(result).toEqual({ processed: 0, failed: 1 });

    const updated = await localStore.getById(species.id);
    expect(updated?.syncStatus).toBe('error');
    expect(updated?.lastSyncError).toBe('network unreachable');

    const pending = await queue.listPending();
    expect(pending).toHaveLength(1);
    expect(pending[0]?.attempts).toBe(1);
  });

  it('soft-deletes remotely for a pending delete operation', async () => {
    const species = await localStore.create(validInput);
    await localStore.softDelete(species.id);
    await queue.enqueue({
      entityType: 'species',
      entityId: species.id,
      operation: 'delete',
      payload: { id: species.id },
    });

    const engine = createSyncEngine(queue, localStore, remoteApi);
    const result = await engine.processPending();

    expect(result).toEqual({ processed: 1, failed: 0 });
    expect(remoteApi.softDelete).toHaveBeenCalledWith(species.id);
    expect(await queue.listPending()).toHaveLength(0);
  });

  it('drops queue items for entity types it does not know how to sync', async () => {
    await queue.enqueue({
      entityType: 'unknown-entity',
      entityId: 'x',
      operation: 'create',
      payload: {},
    });

    const engine = createSyncEngine(queue, localStore, remoteApi);
    const result = await engine.processPending();

    expect(result).toEqual({ processed: 0, failed: 0 });
    expect(await queue.listPending()).toHaveLength(0);
  });
});
