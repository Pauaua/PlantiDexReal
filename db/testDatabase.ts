import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

import type { Database as DrizzleDatabase } from './client';
import * as schema from './schema';

/**
 * Creates an in-memory SQLite database (better-sqlite3) with the same schema
 * as the app's expo-sqlite database, for fast, dependency-free unit tests.
 * Not used at runtime — test-only.
 */
export function createTestDatabase(): DrizzleDatabase {
  const sqlite = new Database(':memory:');
  const migrationSql = readFileSync(
    join(__dirname, 'migrations', '0000_open_slapstick.sql'),
    'utf-8',
  );
  sqlite.exec(migrationSql.replaceAll('--> statement-breakpoint', ''));

  return drizzle(sqlite, { schema }) as unknown as DrizzleDatabase;
}
