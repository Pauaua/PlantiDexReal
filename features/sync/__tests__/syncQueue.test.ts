import type { Database } from '@db/client';
import { createTestDatabase } from '@db/testDatabase';

import { createSyncQueue, type SyncQueueStore } from '../syncQueue';

describe('syncQueue', () => {
  let db: Database;
  let queue: SyncQueueStore;

  beforeEach(() => {
    db = createTestDatabase();
    queue = createSyncQueue(db);
  });

  it('enqueues an operation with the payload serialized as JSON', async () => {
    await queue.enqueue({
      entityType: 'species',
      entityId: 'sp-1',
      operation: 'create',
      payload: { commonName: 'Copihue' },
    });

    const pending = await queue.listPending();

    expect(pending).toHaveLength(1);
    expect(pending[0]?.entityId).toBe('sp-1');
    expect(JSON.parse(pending[0]?.payload ?? '{}')).toEqual({ commonName: 'Copihue' });
  });

  it('lists pending items oldest first', async () => {
    await queue.enqueue({ entityType: 'species', entityId: 'a', operation: 'create', payload: {} });
    await queue.enqueue({ entityType: 'species', entityId: 'b', operation: 'create', payload: {} });

    const pending = await queue.listPending();

    expect(pending.map((item) => item.entityId)).toEqual(['a', 'b']);
  });

  it('removes an item once processed', async () => {
    await queue.enqueue({ entityType: 'species', entityId: 'a', operation: 'create', payload: {} });
    const [item] = await queue.listPending();

    await queue.remove(item!.id);

    expect(await queue.listPending()).toHaveLength(0);
  });

  it('records a failure by incrementing attempts and storing the error', async () => {
    await queue.enqueue({ entityType: 'species', entityId: 'a', operation: 'create', payload: {} });
    const [item] = await queue.listPending();

    await queue.recordFailure(item!.id, 'timeout');
    await queue.recordFailure(item!.id, 'timeout again');

    const [updated] = await queue.listPending();
    expect(updated?.attempts).toBe(2);
    expect(updated?.lastError).toBe('timeout again');
  });
});
