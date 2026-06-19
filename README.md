# 🏨 Hotel Reservation Platform — Architecture Microservices

Projet universitaire — SoA et Microservices | Dr. Salah Gontara | A.U. 2025-26

---

## 📋 Description

Plateforme de réservation d'hôtels basée sur une architecture microservices complète avec :
- **3 Microservices** indépendants (Hotels, Reservations, Notifications)
- **API Gateway** exposant REST et GraphQL
- **gRPC** pour la communication synchrone Gateway ↔ Microservices
- **Kafka** pour la communication asynchrone entre microservices
- **SQLite3** (MS Hotels, MS Reservations) et **JSON/RxDB** (MS Notifications)

---

## 🏗️ Architecture

```
Client (Postman / Navigateur)
        │
        │  REST (HTTP/1.1 + JSON)
        │  GraphQL (HTTP/1.1 + JSON)
        ▼
┌─────────────────┐
│   API Gateway   │  :3000
│  (Express.js)   │
└────────┬────────┘
         │
         │  gRPC (HTTP/2 + Protobuf)
         ├──────────────────────────────┐
         │                              │
         ▼                              ▼
┌─────────────────┐          ┌─────────────────────┐
│  MS-Hotels      │          │  MS-Reservations     │
│  :50051         │          │  :50052              │
│  SQLite3        │          │  SQLite3             │
└────────┬────────┘          └──────────┬──────────┘
         │                              │
         │         Kafka                │
         │    ┌─────────────┐           │
         └───►│ Kafka Broker│◄──────────┘
              │  :9092      │
              └──────┬──────┘
                     │
                     ▼
          ┌─────────────────────┐
          │  MS-Notifications   │
          │  :50053             │
          │  JSON (RxDB style)  │
          └─────────────────────┘
```

---

## 📁 Structure du projet

```
hotel-reservation-platform/
├── api-gateway/
│   └── src/
│       ├── rest/routes.js        ← Endpoints REST
│       ├── graphql/schema.js     ← Schéma + Resolvers GraphQL
│       ├── grpc/clients.js       ← Clients gRPC vers microservices
│       └── index.js              ← Point d'entrée Gateway
├── ms-hotels/
│   └── src/
│       ├── db/database.js        ← SQLite3
│       ├── grpc/server.js        ← Serveur gRPC
│       ├── kafka/producer.js     ← Producteur Kafka
│       └── index.js
├── ms-reservations/
│   └── src/
│       ├── db/database.js        ← SQLite3
│       ├── grpc/server.js        ← Serveur gRPC + publish Kafka
│       ├── kafka/producer.js     ← Producteur Kafka
│       └── index.js
├── ms-notifications/
│   └── src/
│       ├── db/database.js        ← JSON (style NoSQL)
│       ├── grpc/server.js        ← Serveur gRPC
│       ├── kafka/consumer.js     ← Consommateur Kafka
│       └── index.js
├── proto/
│   ├── hotel.proto
│   ├── reservation.proto
│   └── notification.proto
├── docker-compose.yml            ← Kafka + Zookeeper
└── README.md
```

---

## 🔧 Installation et démarrage

### Prérequis
- Node.js v18+
- Docker Desktop

### 1. Cloner le projet
```bash
git clone https://github.com/TON-USERNAME/hotel-reservation-platform.git
cd hotel-reservation-platform
```

### 2. Installer les dépendances
```bash
cd api-gateway && npm install && cd ..
cd ms-hotels && npm install && cd ..
cd ms-reservations && npm install && cd ..
cd ms-notifications && npm install && cd ..
```

### 3. Lancer Kafka avec Docker
```bash
docker-compose up -d
```
Attendre ~15 secondes que Kafka démarre.

### 4. Démarrer les microservices (4 terminaux séparés)

**Terminal 1 — MS Hotels**
```bash
cd ms-hotels && npm start
```

**Terminal 2 — MS Reservations**
```bash
cd ms-reservations && npm start
```

**Terminal 3 — MS Notifications**
```bash
cd ms-notifications && npm start
```

**Terminal 4 — API Gateway**
```bash
cd api-gateway && npm start
```

---

## 🌐 Utilisation

### REST API

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | http://localhost:3000/api/hotels | Liste des hôtels |
| GET | http://localhost:3000/api/hotels/:id | Détail hôtel |
| POST | http://localhost:3000/api/hotels | Ajouter hôtel |
| GET | http://localhost:3000/api/hotels/:id/disponibilite | Disponibilité |
| GET | http://localhost:3000/api/reservations | Toutes réservations |
| POST | http://localhost:3000/api/reservations | Créer réservation |
| DELETE | http://localhost:3000/api/reservations/:id | Annuler réservation |
| GET | http://localhost:3000/api/notifications | Toutes notifications |

### GraphQL

Accès via : **http://localhost:3000/graphql**

```graphql
# Lister les hôtels
query {
  hotels {
    id nom ville etoiles
    chambres { numero type prix disponible }
  }
}

# Créer une réservation
mutation {
  creerReservation(
    userId: "user-001"
    hotelId: "HOTEL_ID_ICI"
    chambreId: "CHAMBRE_ID_ICI"
    dateArrivee: "2025-08-01"
    dateDepart: "2025-08-05"
    nomClient: "Ahmed Ben Ali"
    emailClient: "ahmed@email.com"
  ) {
    id statut dateCreation
  }
}
```

---

## 📨 Topics Kafka

| Topic | Producteur | Consommateur | Déclencheur |
|-------|-----------|--------------|-------------|
| `reservation-created` | MS-Reservations | MS-Notifications | Nouvelle réservation |
| `reservation-cancelled` | MS-Reservations | MS-Notifications | Réservation annulée |

---

## 🗄️ Bases de données

| Microservice | Type | Fichier | Tables/Collections |
|---|---|---|---|
| MS-Hotels | SQLite3 (SQL) | hotels.db | hotels, chambres |
| MS-Reservations | SQLite3 (SQL) | reservations.db | reservations |
| MS-Notifications | JSON/NoSQL | notifications.json | notifications |

---

## 📡 Ports utilisés

| Service | Port | Protocole |
|---------|------|-----------|
| API Gateway | 3000 | HTTP (REST + GraphQL) |
| MS-Hotels | 50051 | gRPC |
| MS-Reservations | 50052 | gRPC |
| MS-Notifications | 50053 | gRPC |
| Kafka | 9092 | TCP |
| Zookeeper | 2181 | TCP |

---

## 👥 Équipe

- Membre 1 : ...
- Membre 2 : ...
