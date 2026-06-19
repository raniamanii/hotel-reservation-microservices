const { startServer } = require('./grpc/server');
const { startConsumer } = require('./kafka/consumer');

async function main() {
  console.log('🚀 Démarrage de MS-Notifications...');

  try {
    await startConsumer();
  } catch (err) {
    console.warn('⚠️  Kafka non disponible:', err.message);
  }

  await startServer();
  console.log('✅ MS-Notifications démarré avec succès');
}

main().catch(console.error);
