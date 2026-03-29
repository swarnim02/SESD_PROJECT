import path from 'path';
import fs from 'fs';
import Database, { Database as DatabaseType } from 'better-sqlite3';

/**
 * Database — Singleton wrapper around better-sqlite3.
 *
 * Design pattern: Singleton. Only one connection exists across the process
 * so repositories share the same transactional context and prepared-statement
 * cache. Schema is kept portable to MySQL/Postgres where practical.
 */
class DatabaseSingleton {
  private static instance: DatabaseSingleton | null = null;
  private readonly db: DatabaseType;

  private constructor() {
    const dbFile = process.env.DB_FILE || path.join(__dirname, '../../data/lostfound.db');
    const dir = path.dirname(dbFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    this.db = new Database(dbFile);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
  }

  static getInstance(): DatabaseSingleton {
    if (!DatabaseSingleton.instance) {
      DatabaseSingleton.instance = new DatabaseSingleton();
    }
    return DatabaseSingleton.instance;
  }

  getConnection(): DatabaseType {
    return this.db;
  }

  close(): void {
    this.db.close();
  }
}

export default DatabaseSingleton.getInstance();
