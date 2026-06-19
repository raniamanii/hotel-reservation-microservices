const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'ms-hotels',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

async function connectProducer() {
  await producer.connect();
  console.log('✅ MS-Hotels Kafka producer connecté');
}

async function publishEvent(topic, message) {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }]
  });
  console.log(`📤 Événement publié sur topic [${topic}]:`, message);
}

module.exports = { connectProducer, publishEvent };
