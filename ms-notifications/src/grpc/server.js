const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const db = require('../db/database');

const PROTO_PATH = path.join(__dirname, '../../../proto/notification.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
});
const notifProto = grpc.loadPackageDefinition(packageDef).notification;

async function GetNotifications(call, callback) {
  try {
    const notifications = await db.getByUserId(call.request.userId);
    callback(null, { notifications });
  } catch (err) { callback({ code: grpc.status.INTERNAL, message: err.message }); }
}

async function GetAllNotifications(call, callback) {
  try {
    const notifications = await db.getAll();
    callback(null, { notifications });
  } catch (err) { callback({ code: grpc.status.INTERNAL, message: err.message }); }
}

async function MarkAsRead(call, callback) {
  try {
    const ok = await db.markAsRead(call.request.id);
    callback(null, { succes: ok, message: ok ? 'Marquée comme lue' : 'Non trouvée' });
  } catch (err) { callback({ code: grpc.status.INTERNAL, message: err.message }); }
}

async function startServer() {
  await db.getDB(); // base RxDB prête AVANT de démarrer gRPC

  return new Promise((resolve, reject) => {
    const server = new grpc.Server();
    server.addService(notifProto.NotificationService.service, {
      GetNotifications, GetAllNotifications, MarkAsRead
    });
    server.bindAsync('0.0.0.0:50053', grpc.ServerCredentials.createInsecure(), (err, port) => {
      if (err) { reject(err); return; }
      console.log(`✅ MS-Notifications gRPC démarré sur le port ${port}`);
      resolve();
    });
  });
}

module.exports = { startServer };