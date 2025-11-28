import { Database } from '../database/database';

describe('Database', () => {
  let database: Database;

  beforeEach(async () => {
    database = Database.getInstance();
    await database.initialize();
  });

  afterEach(async () => {
    await database.reset();
    await database.close();
  });

  it('should be a singleton', () => {
    const instance1 = Database.getInstance();
    const instance2 = Database.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should initialize database', async () => {
    const db = database.getDatabase();
    expect(db).toBeDefined();
  });

  it('should throw error when getting database before initialization', async () => {
    await database.close();

    expect(() => database.getDatabase()).toThrow('Database not initialized');

    await database.initialize();
  });

  it('should create notes table on initialization', async () => {
    const db = database.getDatabase();

    const result = await db.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='notes'"
    );

    expect(result).toBeDefined();
    expect(result?.name).toBe('notes');
  });

  it('should create index on updated_at column', async () => {
    const db = database.getDatabase();

    const result = await db.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_notes_updated_at'"
    );

    expect(result).toBeDefined();
    expect(result?.name).toBe('idx_notes_updated_at');
  });

  it('should reset database tables', async () => {
    const db = database.getDatabase();

    await db.runAsync(
      'INSERT INTO notes (id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      ['test-id', 'Test', 'Content', Date.now(), Date.now()]
    );

    let count = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM notes');
    expect(count?.count).toBe(1);

    await database.reset();

    count = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM notes');
    expect(count?.count).toBe(0);
  });
});
