import { sql } from 'drizzle-orm';
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const CONSERVATION_STATUSES = [
  'least_concern',
  'near_threatened',
  'vulnerable',
  'endangered',
  'critically_endangered',
  'extinct_in_the_wild',
  'unknown',
] as const;

export type ConservationStatus = (typeof CONSERVATION_STATUSES)[number];

export const SYNC_STATUSES = ['pending', 'synced', 'error'] as const;
export type SyncStatus = (typeof SYNC_STATUSES)[number];

export const species = sqliteTable(
  'species',
  {
    id: text('id').primaryKey(),
    commonName: text('common_name').notNull(),
    scientificName: text('scientific_name').notNull(),
    description: text('description'),
    conservationStatus: text('conservation_status').notNull(),
    latitude: real('latitude').notNull(),
    longitude: real('longitude').notNull(),
    photoLocalUri: text('photo_local_uri'),
    photoRemoteUrl: text('photo_remote_url'),
    authorId: text('author_id'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    syncStatus: text('sync_status').notNull().default('pending'),
    lastSyncError: text('last_sync_error'),
    deletedAt: integer('deleted_at'),
  },
  (table) => [
    index('species_sync_status_idx').on(table.syncStatus),
    index('species_deleted_at_idx').on(table.deletedAt),
  ],
);

export type SpeciesRow = typeof species.$inferSelect;
export type NewSpeciesRow = typeof species.$inferInsert;

export const syncQueue = sqliteTable(
  'sync_queue',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    operation: text('operation').notNull(),
    payload: text('payload').notNull(),
    attempts: integer('attempts').notNull().default(0),
    lastError: text('last_error'),
    createdAt: integer('created_at')
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [index('sync_queue_entity_idx').on(table.entityType, table.entityId)],
);

export type SyncQueueRow = typeof syncQueue.$inferSelect;
export type NewSyncQueueRow = typeof syncQueue.$inferInsert;
