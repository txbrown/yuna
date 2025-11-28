export class MockSQLiteDatabase {
  private tables: Map<string, any[]> = new Map();
  private schema: Map<string, string> = new Map();
  private indexes: Map<string, string> = new Map();

  async execAsync(sql: string): Promise<void> {
    const createTableMatch = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/);
    if (createTableMatch) {
      const tableName = createTableMatch[1];
      this.tables.set(tableName, []);
      this.schema.set(tableName, sql);
    }

    const createIndexMatch = sql.match(/CREATE INDEX IF NOT EXISTS (\w+)/);
    if (createIndexMatch) {
      const indexName = createIndexMatch[1];
      this.indexes.set(indexName, sql);
    }

    const dropTableMatch = sql.match(/DROP TABLE IF EXISTS (\w+)/);
    if (dropTableMatch) {
      const tableName = dropTableMatch[1];
      this.tables.delete(tableName);
      this.schema.delete(tableName);
    }
  }

  async runAsync(sql: string, params: any[] = []): Promise<any> {
    const insertMatch = sql.match(/INSERT INTO (\w+) \((.*?)\) VALUES/);
    if (insertMatch) {
      const tableName = insertMatch[1];
      const columns = insertMatch[2].split(',').map((c) => c.trim());
      const table = this.tables.get(tableName) || [];

      const row: any = {};
      columns.forEach((col, index) => {
        row[col] = params[index];
      });

      table.push(row);
      this.tables.set(tableName, table);
      return { changes: 1, lastInsertRowId: table.length };
    }

    const updateMatch = sql.match(/UPDATE (\w+) SET (.*?) WHERE (.*)/);
    if (updateMatch) {
      const tableName = updateMatch[1];
      const table = this.tables.get(tableName) || [];
      const whereClause = updateMatch[3];

      let changes = 0;
      table.forEach((row) => {
        if (this.matchesWhere(row, whereClause, params.slice(-1))) {
          const sets = updateMatch[2].split(',');
          let paramIndex = 0;
          sets.forEach((set) => {
            const [col] = set.trim().split('=').map((s) => s.trim());
            row[col] = params[paramIndex++];
          });
          changes++;
        }
      });

      return { changes };
    }

    const deleteMatch = sql.match(/DELETE FROM (\w+) WHERE (.*)/);
    if (deleteMatch) {
      const tableName = deleteMatch[1];
      const whereClause = deleteMatch[2];
      const table = this.tables.get(tableName) || [];

      const initialLength = table.length;
      const filtered = table.filter((row) => !this.matchesWhere(row, whereClause, params));
      this.tables.set(tableName, filtered);

      return { changes: initialLength - filtered.length };
    }

    return { changes: 0 };
  }

  async getAllAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
    const selectMatch = sql.match(/SELECT (.*?) FROM (\w+)(?: ORDER BY (.*))?/);
    if (selectMatch) {
      const tableName = selectMatch[2];
      const orderBy = selectMatch[3];
      let table = [...(this.tables.get(tableName) || [])];

      if (orderBy) {
        const [column, direction] = orderBy.split(/\s+/);
        table.sort((a, b) => {
          const aVal = a[column];
          const bVal = b[column];
          const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return direction?.toUpperCase() === 'DESC' ? -result : result;
        });
      }

      return table as T[];
    }
    return [];
  }

  async getFirstAsync<T>(sql: string, params: any[] = []): Promise<T | null> {
    if (sql.includes('sqlite_master')) {
      const nameMatch = sql.match(/name='(\w+)'/);
      if (nameMatch) {
        const name = nameMatch[1];
        if (sql.includes("type='table'") && this.schema.has(name)) {
          return { name } as T;
        }
        if (sql.includes("type='index'") && this.indexes.has(name)) {
          return { name } as T;
        }
      }
    }

    if (sql.includes('COUNT(*)')) {
      const tableName = sql.match(/FROM (\w+)/)?.[1];
      const count = tableName ? (this.tables.get(tableName) || []).length : 0;
      return { count } as T;
    }

    const selectMatch = sql.match(/SELECT (.*?) FROM (\w+)(?: WHERE (.*))?/);
    if (selectMatch) {
      const tableName = selectMatch[2];
      const whereClause = selectMatch[3];
      const table = this.tables.get(tableName) || [];

      if (whereClause) {
        const row = table.find((r) => this.matchesWhere(r, whereClause, params));
        return (row || null) as T | null;
      }

      return (table[0] || null) as T | null;
    }

    return null;
  }

  private matchesWhere(row: any, whereClause: string, params: any[]): boolean {
    const match = whereClause.match(/(\w+)\s*=\s*\?/);
    if (match) {
      const column = match[1];
      return row[column] === params[0];
    }
    return false;
  }

  async closeAsync(): Promise<void> {
    this.tables.clear();
    this.schema.clear();
    this.indexes.clear();
  }
}

let mockDatabase: MockSQLiteDatabase | null = null;

export async function openDatabaseAsync(name: string): Promise<MockSQLiteDatabase> {
  if (!mockDatabase) {
    mockDatabase = new MockSQLiteDatabase();
  }
  return mockDatabase;
}

export function resetMockDatabase(): void {
  mockDatabase = null;
}
