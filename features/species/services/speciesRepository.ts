import { db } from '@db/client';
import { createSyncQueue } from '@features/sync/syncQueue';

import {
  createLocalSpeciesStore,
  type CreateSpeciesInput,
  type UpdateSpeciesInput,
} from './localSpeciesStore';

const localStore = createLocalSpeciesStore(db);
const syncQueue = createSyncQueue(db);

/**
 * Public data-access surface for the species feature. UI code and hooks talk
 * only to this repository — never to Drizzle/SQLite or Supabase directly —
 * so persistence can be tested and swapped independently of the screens.
 */
export const speciesRepository = {
  listAll: localStore.listAll,
  getById: localStore.getById,

  async create(input: CreateSpeciesInput) {
    const row = await localStore.create(input);
    await syncQueue.enqueue({
      entityType: 'species',
      entityId: row.id,
      operation: 'create',
      payload: row,
    });
    return row;
  },

  async update(id: string, patch: UpdateSpeciesInput) {
    const row = await localStore.update(id, patch);
    await syncQueue.enqueue({
      entityType: 'species',
      entityId: row.id,
      operation: 'update',
      payload: row,
    });
    return row;
  },

  async remove(id: string) {
    await localStore.softDelete(id);
    await syncQueue.enqueue({
      entityType: 'species',
      entityId: id,
      operation: 'delete',
      payload: { id },
    });
  },
};
