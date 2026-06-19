const { startServer, setKafkaProducer } = require('./grpc/server');
const { connectProducer, publishEvent } = require('./kafka/producer');

async function main() {
  console.log('🚀 Démarrage de MS-Reservations...');

  try {
    await connectProducer();
    setKafkaProducer(publishEvent);
  } catch (err) {
    console.warn('⚠️  Kafka non disponible:', err.message);
  }

  await startServer();
}

main().catch(console.error);
