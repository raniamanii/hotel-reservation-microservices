const { Kafka } = require('kafkajs');
const db = require('../db/database');

const kafka = new Kafka({ clientId: 'ms-notifications', brokers: ['localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'notifications-group' });

async function startConsumer() {
  await consumer.connect();
  console.log('✅ MS-Notifications Kafka consumer connecté');

  await consumer.subscribe({ topics: ['reservation-created', 'reservation-cancelled'], fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const data = JSON.parse(message.value.toString());
      console.log(`📥 Événement reçu [${topic}]:`, data);

      if (topic === 'reservation-created') {
        await db.addNotification({
          userId: data.userId,
          type: 'RESERVATION_CONFIRMEE',
          message: `Bonjour ${data.nomClient}, votre réservation (ID: ${data.reservationId}) est confirmée du ${data.dateArrivee} au ${data.dateDepart}.`
        });
        console.log(`🔔 Notification de confirmation créée pour ${data.emailClient}`);
      }

      if (topic === 'reservation-cancelled') {
        await db.addNotification({
          userId: data.userId,
          type: 'RESERVATION_ANNULEE',
          message: `Bonjour ${data.nomClient}, votre réservation (ID: ${data.reservationId}) a été annulée.`
        });
        console.log(`🔔 Notification d'annulation créée pour ${data.emailClient}`);
      }
    }
  });
}

module.exports = { startConsumer };