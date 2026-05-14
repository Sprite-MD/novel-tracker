import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = path.join(process.cwd(), 'data', 'novels.db')

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')

  _db.exec(`
    CREATE TABLE IF NOT EXISTS novels (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      chapter     TEXT,
      last_read   TEXT,
      notes       TEXT,
      origin      TEXT,
      status      TEXT NOT NULL DEFAULT '[]',
      liked       INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    );
  `)

  return _db
}
