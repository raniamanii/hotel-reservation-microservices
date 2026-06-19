const { createRxDatabase, addRxPlugin } = require('rxdb');
const { getRxStorageMemory } = require('rxdb/plugins/storage-memory');
const { RxDBJsonDumpPlugin } = require('rxdb/plugins/json-dump');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

addRxPlugin(RxDBJsonDumpPlugin);

const DUMP_PATH = path.join(__dirname, 'notifications-rxdb-dump.json');

const notificationSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    userId: { type: 'string' },
    type: { type: 'string' },
    message: { type: 'string' },
    lu: { type: 'boolean' },
    dateCreation: { type: 'string' }
  },
  required: ['id', 'userId', 'type', 'message', 'lu', 'dateCreation']
};

let dbPromise = null;

async function getDB() {
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    // RxDB tourne en mémoire (gratuit, rapide) ; on recharge/sauvegarde
    // un dump JSON sur disque nous-mêmes pour avoir une vraie persistance.
    const db = await createRxDatabase({
      name: 'notificationsdb',
      storage: getRxStorageMemory()
    });

    await db.addCollections({
      notifications: { schema: notificationSchema }
    });

    if (fs.existsSync(DUMP_PATH)) {
      const dump = JSON.parse(fs.readFileSync(DUMP_PATH, 'utf-8'));
      await db.importJSON(dump);
      console.log('Base notifications (RxDB / NoSQL) rechargée depuis', DUMP_PATH);
    } else {
      console.log('Base notifications (RxDB / NoSQL) initialisée (nouvelle base)');
    }

    return db;
  })();

  return dbPromise;
}

// Sauvegarde l'état complet de la base sur disque (appelée après chaque écriture)
async function persist() {
  const db = await getDB();
  const dump = await db.exportJSON();
  fs.writeFileSync(DUMP_PATH, JSON.stringify(dump));
}

async function addNotification({ userId, type, message }) {
  const db = await getDB();
  const doc = {
    id: uuidv4(),
    userId,
    type,
    message,
    lu: false,
    dateCreation: new Date().toISOString()
  };
  await db.notifications.insert(doc);
  await persist();
  return doc;
}

async function getByUserId(userId) {
  const db = await getDB();
  const docs = await db.notifications.find({ selector: { userId } }).exec();
  return docs.map(d => d.toJSON());
}

async function getAll() {
  const db = await getDB();
  const docs = await db.notifications.find().exec();
  return docs.map(d => d.toJSON());
}

async function markAsRead(id) {
  const db = await getDB();
  const doc = await db.notifications.findOne(id).exec();
  if (!doc) return false;
  await doc.patch({ lu: true });
  await persist();
  return true;
}

module.exports = { getDB, addNotification, getByUserId, getAll, markAsRead };