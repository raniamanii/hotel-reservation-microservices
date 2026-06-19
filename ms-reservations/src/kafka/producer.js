const { Kafka } = require('kafkajs');

const kafka = new Kafka({ clientId: 'ms-reservations', brokers: ['localhost:9092'] });
const producer = kafka.producer();

async function connectProducer() {
  await producer.connect();
  console.log('✅ MS-Reservations Kafka producer connecté');
}

async function publishEvent(topic, message) {
  await producer.send({ topic, messages: [{ value: JSON.stringify(message) }] });
  console.log(`📤 Événement publié [${topic}]:`, message);
}

module.exports = { connectProducer, publishEvent };
