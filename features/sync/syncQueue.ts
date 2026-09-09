import { asc, eq } from 'drizzle-orm';

import type { Database } from '@db/client';
import { syncQueue, type NewSyncQueueRow, type SyncQueueRow } from '@db/schema';

export type SyncOperation = 'create' | 'update' | 'delete';

export interface EnqueueInput {
  entityType: string;
  entityId: string;
  operation: SyncOperation;
  payload: unknown;
}

export function createSyncQueue(database: Database) {
  return {
    async enqueue({ entityType, entityId, operation, payload }: EnqueueInput): Promise<void> {
      const row: NewSyncQueueRow = {
        entityType,
        entityId,
        operation,
        payload: JSON.stringify(payload),
        attempts: 0,
        createdAt: Date.now(),
      };
      await database.insert(syncQueue).values(row);
    },

    async listPending(): Promise<SyncQueueRow[]> {
      return database.select().from(syncQueue).orderBy(asc(syncQueue.createdAt));
    },

    async remove(id: number): Promise<void> {
      await database.delete(syncQueue).where(eq(syncQueue.id, id));
    },

    async recordFailure(id: number, error: string): Promise<void> {
      const [existing] = await database.select().from(syncQueue).where(eq(syncQueue.id, id));
      await database
        .update(syncQueue)
        .set({ attempts: (existing?.attempts ?? 0) + 1, lastError: error })
        .where(eq(syncQueue.id, id));
    },
  };
}

export type SyncQueueStore = ReturnType<typeof createSyncQueue>;
