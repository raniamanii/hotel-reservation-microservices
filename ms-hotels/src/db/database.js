const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Vrai fichier SQLite3 sur disque (et non plus un blob JSON encodé en base64)
const DB_PATH = path.join(__dirname, 'hotels.db');
let db = null;

async function getDB() {
  if (db) return db;

  const isNewDB = !require('fs').existsSync(DB_PATH);
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS hotels (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      ville TEXT NOT NULL,
      adresse TEXT NOT NULL,
      etoiles INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chambres (
      id TEXT PRIMARY KEY,
      hotel_id TEXT NOT NULL,
      numero INTEGER NOT NULL,
      type TEXT NOT NULL,
      prix REAL NOT NULL,
      disponible INTEGER DEFAULT 1
    );
  `);

  if (isNewDB) {
    const hotel1Id = uuidv4();
    const hotel2Id = uuidv4();
    run('INSERT INTO hotels VALUES (?, ?, ?, ?, ?)', [hotel1Id, 'Hotel Medina Palace', 'Tunis', 'Avenue Habib Bourguiba, Tunis', 5]);
    run('INSERT INTO hotels VALUES (?, ?, ?, ?, ?)', [hotel2Id, 'Hotel Carthage', 'Carthage', 'Rue de Carthage, Carthage', 4]);
    run('INSERT INTO chambres VALUES (?, ?, ?, ?, ?, ?)', [uuidv4(), hotel1Id, 101, 'Simple', 150.0, 1]);
    run('INSERT INTO chambres VALUES (?, ?, ?, ?, ?, ?)', [uuidv4(), hotel1Id, 102, 'Double', 250.0, 1]);
    run('INSERT INTO chambres VALUES (?, ?, ?, ?, ?, ?)', [uuidv4(), hotel1Id, 201, 'Suite', 500.0, 1]);
    run('INSERT INTO chambres VALUES (?, ?, ?, ?, ?, ?)', [uuidv4(), hotel2Id, 101, 'Simple', 100.0, 1]);
    run('INSERT INTO chambres VALUES (?, ?, ?, ?, ?, ?)', [uuidv4(), hotel2Id, 102, 'Double', 180.0, 1]);
    console.log('Base hotels (SQLite3) initialisée avec données de test');
  } else {
    console.log('Base hotels (SQLite3) chargée depuis', DB_PATH);
  }

  return db;
}

// Garde la même signature que l'ancienne version basée sur sql.js,
// donc rien à changer dans grpc/server.js
function query(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

function run(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.run(...params);
}

module.exports = { getDB, query, run };