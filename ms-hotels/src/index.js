const { startServer } = require('./grpc/server');
const { connectProducer } = require('./kafka/producer');

async function main() {
  console.log('🚀 Démarrage de MS-Hotels...');

  try {
    await connectProducer();
  } catch (err) {
    console.warn('⚠️  Kafka non disponible, continue sans Kafka:', err.message);
  }

  await startServer();
}

main().catch(console.error);
