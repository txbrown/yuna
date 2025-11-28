import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'yuna.db';
const NOTES_TABLE = 'notes';

export class Database {
  private static instance: Database;
  private db: SQLite.SQLiteDatabase | null = null;

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async initialize(): Promise<void> {
    if (this.db) {
      return;
    }

    this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await this.runMigrations();
  }

  private async runMigrations(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${NOTES_TABLE} (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON ${NOTES_TABLE}(updated_at DESC);
    `);
  }

  getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }

  async reset(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    await this.db.execAsync(`DROP TABLE IF EXISTS ${NOTES_TABLE};`);
    await this.runMigrations();
  }
}

export const database = Database.getInstance();
