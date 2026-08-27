import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'sqlite.db');
const db = new Database(dbPath);

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      userId TEXT,
      title TEXT NOT NULL,
      code TEXT,
      clientName TEXT,
      location TEXT,
      category TEXT,
      budget TEXT,
      status TEXT,
      owner TEXT,
      lastModified TEXT,
      tags TEXT, -- JSON array string
      companyProfile TEXT, -- JSON object string
      isArchived INTEGER DEFAULT 0, -- 0 for false, 1 for true
      FOREIGN KEY (userId) REFERENCES users(email) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      projectId TEXT,
      title TEXT NOT NULL,
      docType TEXT NOT NULL, -- 'tax_invoice', 'quotation', 'work_order', etc.
      docNumber TEXT,
      status TEXT DEFAULT 'draft',
      lastModified TEXT,
      document TEXT, -- JSON object string of the LatexDocument state
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      userId TEXT,
      name TEXT NOT NULL,
      description TEXT,
      createdAt TEXT,
      document TEXT, -- JSON object string of LatexDocument
      FOREIGN KEY (userId) REFERENCES users(email) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS document_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      documentId TEXT NOT NULL,
      projectId TEXT NOT NULL,
      versionNumber INTEGER NOT NULL,
      savedAt TEXT NOT NULL,
      savedBy TEXT,
      document TEXT NOT NULL,
      FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS doc_counters (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      docType TEXT NOT NULL,
      lastNumber INTEGER DEFAULT 0
    );
  `);

  // Seed default admin and guest users for quick testing
  try {
    const insertAdmin = db.prepare("INSERT OR IGNORE INTO users (id, name, email, password) VALUES ('usr_admin', 'Admin User', 'admin@admin.com', 'admin@123')");
    insertAdmin.run();

    const insertGuest = db.prepare("INSERT OR IGNORE INTO users (id, name, email, password) VALUES ('usr_guest', 'Guest User', 'guest', 'guest123')");
    insertGuest.run();
  } catch (error) {
    console.error('Error initializing database:', error);
  }

  // Handle schema migrations safely
  const migrations = [
    "ALTER TABLE projects ADD COLUMN companyProfile TEXT;",
    "ALTER TABLE projects ADD COLUMN isFavourite INTEGER DEFAULT 0;",
    "ALTER TABLE projects ADD COLUMN clientAddress TEXT;",
    "ALTER TABLE projects ADD COLUMN clientGstNo TEXT;",
    "ALTER TABLE projects ADD COLUMN contactPerson TEXT;",
  ];
  for (const migration of migrations) {
    try {
      db.exec(migration);
    } catch (error) {
      // Ignore error if column already exists
    }
  }
}

initDb();
export default db;
