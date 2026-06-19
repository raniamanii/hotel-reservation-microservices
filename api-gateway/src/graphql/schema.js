const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const grpcClients = require('../grpc/clients');

// ==================== SCHEMA GRAPHQL ====================
const typeDefs = `#graphql

  type Chambre {
    id: String
    numero: Int
    type: String
    prix: Float 
    disponible: Boolean
  }

  type Hotel {
    id: String
    nom: String
    ville: String
    adresse: String
    etoiles: Int
    chambres: [Chambre]
  }

  type Reservation {
    id: String
    userId: String
    hotelId: String
    chambreId: String
    dateArrivee: String
    dateDepart: String
    nomClient: String
    emailClient: String
    statut: String
    dateCreation: String
  }

  type Notification {
    id: String
    userId: String
    type: String
    message: String
    lu: Boolean
    dateCreation: String
  }

  type StatusResponse {
    succes: Boolean
    message: String
  }

  type AvailabilityResponse {
    disponible: Boolean
    chambresDisponibles: [Chambre]
  }

  # Queries : lire des données
  type Query {
    hotels: [Hotel]
    hotel(id: String!): Hotel
    hotelDisponibilite(hotelId: String!, dateArrivee: String!, dateDepart: String!): AvailabilityResponse

    reservations: [Reservation]
    reservation(id: String!): Reservation
    reservationsUser(userId: String!): [Reservation]

    notifications: [Notification]
    notificationsUser(userId: String!): [Notification]
  }

  # Mutations : modifier des données
  type Mutation {
    ajouterHotel(nom: String!, ville: String!, adresse: String!, etoiles: Int!): Hotel

    creerReservation(
      userId: String!
      hotelId: String!
      chambreId: String!
      dateArrivee: String!
      dateDepart: String!
      nomClient: String!
      emailClient: String!
    ): Reservation

    annulerReservation(id: String!): StatusResponse
    marquerNotificationLue(id: String!): StatusResponse
  }
`;

// ==================== RESOLVERS ====================
const resolvers = {
  Query: {
    hotels: async () => {
      const result = await grpcClients.hotel.getHotels({});
      return result.hotels;
    },
    hotel: async (_, { id }) => {
      return await grpcClients.hotel.getHotelById({ id });
    },
    hotelDisponibilite: async (_, { hotelId, dateArrivee, dateDepart }) => {
      return await grpcClients.hotel.checkAvailability({ hotelId, dateArrivee, dateDepart });
    },
    reservations: async () => {
      const result = await grpcClients.reservation.getAllReservations({});
      return result.reservations;
    },
    reservation: async (_, { id }) => {
      return await grpcClients.reservation.getReservation({ id });
    },
    reservationsUser: async (_, { userId }) => {
      const result = await grpcClients.reservation.getUserReservations({ userId });
      return result.reservations;
    },
    notifications: async () => {
      const result = await grpcClients.notification.getAllNotifications({});
      return result.notifications;
    },
    notificationsUser: async (_, { userId }) => {
      const result = await grpcClients.notification.getNotifications({ userId });
      return result.notifications;
    }
  },
  Mutation: {
    ajouterHotel: async (_, { nom, ville, adresse, etoiles }) => {
      return await grpcClients.hotel.addHotel({ nom, ville, adresse, etoiles });
    },
    creerReservation: async (_, args) => {
      return await grpcClients.reservation.createReservation(args);
    },
    annulerReservation: async (_, { id }) => {
      return await grpcClients.reservation.cancelReservation({ id });
    },
    marquerNotificationLue: async (_, { id }) => {
      return await grpcClients.notification.markAsRead({ id });
    }
  }
};

async function createGraphQLMiddleware() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  return expressMiddleware(server);
}

module.exports = { createGraphQLMiddleware };

//Ce module implémente un serveur GraphQL 
// basé sur Apollo Server
//  dans l’API Gateway. Il permet aux clients de récupérer ou modifier
//  des données de manière flexible.
//  Les resolvers traduisent
//  les requêtes GraphQL en appels gRPC vers
//  les microservices.