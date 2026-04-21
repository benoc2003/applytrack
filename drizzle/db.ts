import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';

export const sqlite = SQLite.openDatabaseSync('applytrack.db');
export const db = drizzle(sqlite);