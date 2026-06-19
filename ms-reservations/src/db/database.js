const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'reservations.db');
let db = null;

async function getDB() {
  if (db) return db;

  const isNewDB = !require('fs').existsSync(DB_PATH);
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      hotelId TEXT NOT NULL,
      chambreId TEXT NOT NULL,
      dateArrivee TEXT NOT NULL,
      dateDepart TEXT NOT NULL,
      nomClient TEXT NOT NULL,
      emailClient TEXT NOT NULL,
      statut TEXT DEFAULT 'CONFIRMEE',
      dateCreation TEXT NOT NULL
    );
  `);

  console.log(isNewDB
    ? 'Base reservations (SQLite3) initialisée'
    : 'Base reservations (SQLite3) chargée depuis ' + DB_PATH);

  return db;
}

function query(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

function run(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.run(...params);
}

module.exports = { getDB, query, run };