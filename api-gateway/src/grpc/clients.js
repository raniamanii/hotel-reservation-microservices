const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const opts = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
};

const hotelProto = grpc.loadPackageDefinition(
  protoLoader.loadSync(path.join(__dirname, '../../../proto/hotel.proto'), opts)
).hotel;

const reservationProto = grpc.loadPackageDefinition(
  protoLoader.loadSync(path.join(__dirname, '../../../proto/reservation.proto'), opts)
).reservation;

const notifProto = grpc.loadPackageDefinition(
  protoLoader.loadSync(path.join(__dirname, '../../../proto/notification.proto'), opts)
).notification;

const channelOptions = {
  'grpc.initial_reconnect_backoff_ms': 500,
  'grpc.max_reconnect_backoff_ms': 5000,
  'grpc.enable_retries': 1,
};

const hotelClient = new hotelProto.HotelService('localhost:50051', grpc.credentials.createInsecure(), channelOptions);
const reservationClient = new reservationProto.ReservationService('localhost:50052', grpc.credentials.createInsecure(), channelOptions);
const notifClient = new notifProto.NotificationService('localhost:50053', grpc.credentials.createInsecure(), channelOptions);

function promisify(client, method) {
  return (request) => new Promise((resolve, reject) => {
    const deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + 15);
    client[method](request, { deadline }, (err, response) => {
      if (err) reject(err);
      else resolve(response);
    });
  });
}

module.exports = {
  hotel: {
    getHotels: promisify(hotelClient, 'GetHotels'),
    getHotelById: promisify(hotelClient, 'GetHotelById'),
    addHotel: promisify(hotelClient, 'AddHotel'),
    checkAvailability: promisify(hotelClient, 'CheckAvailability'),
    updateDisponibilite: promisify(hotelClient, 'UpdateChambreDisponibilite')
  },
  reservation: {
    createReservation: promisify(reservationClient, 'CreateReservation'),
    getReservation: promisify(reservationClient, 'GetReservation'),
    getUserReservations: promisify(reservationClient, 'GetUserReservations'),
    getAllReservations: promisify(reservationClient, 'GetAllReservations'),
    cancelReservation: promisify(reservationClient, 'CancelReservation')
  },
  notification: {
    getNotifications: promisify(notifClient, 'GetNotifications'),
    getAllNotifications: promisify(notifClient, 'GetAllNotifications'),
    markAsRead: promisify(notifClient, 'MarkAsRead')
  }
};



//Ce module implémente des clients gRPC dans l’API Gateway.
//  Il charge les fichiers .proto et permet de communiquer avec les microservices 
// via des appels gRP