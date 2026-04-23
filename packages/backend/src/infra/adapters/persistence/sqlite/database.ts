import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class DatabaseConnection {
  private static instance: sqlite3.Database;

  static getInstance(dbPath: string): sqlite3.Database {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Database connection error:', err.message);
          process.exit(1);
        }
        console.log('✓ Connected to SQLite database');
        DatabaseConnection.instance.run('PRAGMA foreign_keys = ON');
        DatabaseConnection.initializeTables();
        DatabaseConnection.seedData();
      });
    }
    return DatabaseConnection.instance;
  }

  private static initializeTables(): void {
    const sqlPath = join(__dirname, '../../..', 'database', 'init.sql');
    const sql = readFileSync(sqlPath, 'utf-8');

    DatabaseConnection.instance.exec(sql, (err) => {
      if (err) {
        console.error('Error initializing tables:', err.message);
      } else {
        console.log('✓ Database tables initialized');
      }
    });
  }

  private static seedData(): void {
    const seedPath = join(__dirname, '../../..', 'database', 'seeds.sql');
    const sql = readFileSync(seedPath, 'utf-8');

    DatabaseConnection.instance.exec(sql, (err) => {
      if (err) {
        console.error('Error seeding data:', err.message);
      } else {
        console.log('✓ Database seeded with sample data');
      }
    });
  }

  static close(): void {
    if (DatabaseConnection.instance) {
      DatabaseConnection.instance.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        }
      });
    }
  }
}
