import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

import { db } from './client';
import migrations from './migrations/migrations';

/**
 * Runs pending Drizzle migrations against the local SQLite database.
 * Call once, near the app root, before rendering data-dependent screens.
 */
export function useDatabaseMigrations() {
  return useMigrations(db, migrations);
}
