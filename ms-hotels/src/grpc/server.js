const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getDB, query, run } = require('../db/database');

const PROTO_PATH = path.join(__dirname, '../../../proto/hotel.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
});
const hotelProto = grpc.loadPackageDefinition(packageDef).hotel;

function GetHotels(call, callback) {
  try {
    const hotels = query('SELECT * FROM hotels');
    const result = hotels.map(h => {
      const chambres = query('SELECT * FROM chambres WHERE hotel_id = ?', [h.id]);
      return { ...h, chambres: chambres.map(c => ({ ...c, disponible: c.disponible === 1 })) };
    });
    callback(null, { hotels: result });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

function GetHotelById(call, callback) {
  try {
    const hotels = query('SELECT * FROM hotels WHERE id = ?', [call.request.id]);
    if (!hotels.length) return callback({ code: grpc.status.NOT_FOUND, message: 'Hotel non trouvé' });
    const hotel = hotels[0];
    const chambres = query('SELECT * FROM chambres WHERE hotel_id = ?', [hotel.id]);
    callback(null, { ...hotel, chambres: chambres.map(c => ({ ...c, disponible: c.disponible === 1 })) });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

function AddHotel(call, callback) {
  try {
    const id = uuidv4();
    const { nom, ville, adresse, etoiles } = call.request;
    run('INSERT INTO hotels VALUES (?, ?, ?, ?, ?)', [id, nom, ville, adresse, etoiles]);
    callback(null, { id, nom, ville, adresse, etoiles, chambres: [] });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

function CheckAvailability(call, callback) {
  try {
    const { hotelId } = call.request;
    const chambres = query('SELECT * FROM chambres WHERE hotel_id = ? AND disponible = 1', [hotelId]);
    callback(null, {
      disponible: chambres.length > 0,
      chambresDisponibles: chambres.map(c => ({ ...c, disponible: true }))
    });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

function UpdateChambreDisponibilite(call, callback) {
  try {
    const { chambreId, disponible } = call.request;
    run('UPDATE chambres SET disponible = ? WHERE id = ?', [disponible ? 1 : 0, chambreId]);
    callback(null, { succes: true, message: 'Disponibilité mise à jour' });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

async function startServer() {
  await getDB(); // ← base de données prête AVANT de démarrer gRPC

  return new Promise((resolve, reject) => {
    const server = new grpc.Server();
    server.addService(hotelProto.HotelService.service, {
      GetHotels, GetHotelById, AddHotel, CheckAvailability, UpdateChambreDisponibilite
    });
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
      if (err) { reject(err); return; }
      console.log(`✅ MS-Hotels gRPC démarré sur le port ${port}`);
      resolve();
    });
  });
}

module.exports = { startServer };
