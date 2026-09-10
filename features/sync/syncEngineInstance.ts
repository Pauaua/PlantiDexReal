import { db } from '@db/client';
import { createLocalSpeciesStore } from '@features/species/services/localSpeciesStore';
import { remoteSpeciesApi } from '@features/species/services/remoteSpeciesApi';

import { createSyncEngine } from './syncEngine';
import { createSyncQueue } from './syncQueue';

export const syncEngine = createSyncEngine(
  createSyncQueue(db),
  createLocalSpeciesStore(db),
  remoteSpeciesApi,
);
