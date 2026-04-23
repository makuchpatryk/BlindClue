import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class DatabaseConnection {
  private static instance: Database.Database;

  static getInstance(dbPath: string): Database.Database {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new Database(dbPath);
      DatabaseConnection.instance.pragma('journal_mode = WAL');
      DatabaseConnection.initializeTables();
      DatabaseConnection.seedData();
    }
    return DatabaseConnection.instance;
  }

  private static initializeTables(): void {
    const sqlPath = join(__dirname, '../../..', 'database', 'init.sql');
    const sql = readFileSync(sqlPath, 'utf-8');
    DatabaseConnection.instance.exec(sql);
  }

  private static seedData(): void {
    const seedPath = join(__dirname, '../../..', 'database', 'seeds.sql');
    const sql = readFileSync(seedPath, 'utf-8');
    DatabaseConnection.instance.exec(sql);
  }

  static close(): void {
    if (DatabaseConnection.instance) {
      DatabaseConnection.instance.close();
    }
  }
}
