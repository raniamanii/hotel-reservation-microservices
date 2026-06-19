const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getDB, query, run } = require('../db/database');

const PROTO_PATH = path.join(__dirname, '../../../proto/reservation.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
});
const reservationProto = grpc.loadPackageDefinition(packageDef).reservation;

let publishEvent = null;
function setKafkaProducer(fn) { publishEvent = fn; }

function CreateReservation(call, callback) {
  try {
    const id = uuidv4();
    const { userId, hotelId, chambreId, dateArrivee, dateDepart, nomClient, emailClient } = call.request;
    const dateCreation = new Date().toISOString();
    run('INSERT INTO reservations VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, userId, hotelId, chambreId, dateArrivee, dateDepart, nomClient, emailClient, 'CONFIRMEE', dateCreation]);
    const reservation = { id, userId, hotelId, chambreId, dateArrivee, dateDepart, nomClient, emailClient, statut: 'CONFIRMEE', dateCreation };
    if (publishEvent) publishEvent('reservation-created', { reservationId: id, userId, hotelId, chambreId, nomClient, emailClient, dateArrivee, dateDepart }).catch(console.error);
    callback(null, reservation);
  } catch (err) { callback({ code: grpc.status.INTERNAL, message: err.message }); }
}

function GetReservation(call, callback) {
  try {
    const rows = query('SELECT * FROM reservations WHERE id = ?', [call.request.id]);
    if (!rows.length) return callback({ code: grpc.status.NOT_FOUND, message: 'Réservation non trouvée' });
    callback(null, rows[0]);
  } catch (err) { callback({ code: grpc.status.INTERNAL, message: err.message }); }
}

function GetUserReservations(call, callback) {
  try {
    const reservations = query('SELECT * FROM reservations WHERE userId = ?', [call.request.userId]);
    callback(null, { reservations });
  } catch (err) { callback({ code: grpc.status.INTERNAL, message: err.message }); }
}

function GetAllReservations(call, callback) {
  try {
    const reservations = query('SELECT * FROM reservations');
    callback(null, { reservations });
  } catch (err) { callback({ code: grpc.status.INTERNAL, message: err.message }); }
}

function CancelReservation(call, callback) {
  try {
    const rows = query('SELECT * FROM reservations WHERE id = ?', [call.request.id]);
    if (!rows.length) return callback({ code: grpc.status.NOT_FOUND, message: 'Réservation non trouvée' });
    const r = rows[0];
    run('UPDATE reservations SET statut = ? WHERE id = ?', ['ANNULEE', call.request.id]);
    if (publishEvent) publishEvent('reservation-cancelled', {
      reservationId: call.request.id, userId: r.userId,
      emailClient: r.emailClient, nomClient: r.nomClient, chambreId: r.chambreId
    }).catch(console.error);
    callback(null, { succes: true, message: 'Réservation annulée' });
  } catch (err) { callback({ code: grpc.status.INTERNAL, message: err.message }); }
}

async function startServer() {
  await getDB();

  return new Promise((resolve, reject) => {
    const server = new grpc.Server();
    server.addService(reservationProto.ReservationService.service, {
      CreateReservation, GetReservation, GetUserReservations, GetAllReservations, CancelReservation
    });
    server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), (err, port) => {
      if (err) { reject(err); return; }
      console.log(`✅ MS-Reservations gRPC démarré sur le port ${port}`);
      resolve();
    });
  });
}

module.exports = { startServer, setKafkaProducer };
