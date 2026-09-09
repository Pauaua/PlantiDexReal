import type { Database } from '@db/client';
import { createTestDatabase } from '@db/testDatabase';

import { createLocalSpeciesStore, type LocalSpeciesStore } from '../services/localSpeciesStore';

describe('localSpeciesStore', () => {
  let db: Database;
  let store: LocalSpeciesStore;

  beforeEach(() => {
    db = createTestDatabase();
    store = createLocalSpeciesStore(db);
  });

  const validInput = {
    commonName: 'Copihue',
    scientificName: 'Lapageria rosea',
    conservationStatus: 'least_concern' as const,
    latitude: -39.8142,
    longitude: -73.2459,
  };

  it('creates a species with pending sync status', async () => {
    const row = await store.create(validInput);

    expect(row.id).toBeTruthy();
    expect(row.commonName).toBe('Copihue');
    expect(row.syncStatus).toBe('pending');
    expect(row.deletedAt).toBeNull();
  });

  it('lists created species ordered by most recent first', async () => {
    const first = await store.create(validInput);
    const second = await store.create({ ...validInput, commonName: 'Araucaria' });

    const all = await store.listAll();

    expect(all.map((row) => row.id)).toEqual([second.id, first.id]);
  });

  it('excludes soft-deleted species from listAll and getById', async () => {
    const row = await store.create(validInput);
    await store.softDelete(row.id);

    expect(await store.listAll()).toHaveLength(0);
    expect(await store.getById(row.id)).toBeUndefined();
  });

  it('updates a species and resets it back to pending sync', async () => {
    const row = await store.create(validInput);
    await store.markSynced(row.id);

    const updated = await store.update(row.id, { commonName: 'Copihue chileno' });

    expect(updated.commonName).toBe('Copihue chileno');
    expect(updated.syncStatus).toBe('pending');
  });

  it('marks a species as synced with the remote photo url', async () => {
    const row = await store.create(validInput);

    await store.markSynced(row.id, 'https://storage.example.com/photo.jpg');

    const synced = await store.getById(row.id);
    expect(synced?.syncStatus).toBe('synced');
    expect(synced?.photoRemoteUrl).toBe('https://storage.example.com/photo.jpg');
  });

  it('marks a species as errored with the failure reason', async () => {
    const row = await store.create(validInput);

    await store.markSyncError(row.id, 'network unreachable');

    const errored = await store.getById(row.id);
    expect(errored?.syncStatus).toBe('error');
    expect(errored?.lastSyncError).toBe('network unreachable');
  });

  it('throws when updating a species that does not exist', async () => {
    await expect(store.update('missing-id', { commonName: 'x' })).rejects.toThrow(
      'Species missing-id not found',
    );
  });
});
