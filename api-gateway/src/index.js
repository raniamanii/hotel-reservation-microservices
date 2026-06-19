const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Servir le frontend
app.use(express.static(path.join(__dirname, '../../frontend')));

app.get('/health', (req, res) => {
  res.json({ statut: 'OK', timestamp: new Date().toISOString() });
});

async function startServer() {
  console.log('⏳ Connexion aux microservices...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  const restRoutes = require('./rest/routes');
  app.use('/api', restRoutes);

  const { createGraphQLMiddleware } = require('./graphql/schema');
  const graphqlMiddleware = await createGraphQLMiddleware();
  app.use('/graphql', bodyParser.json(), graphqlMiddleware);

  app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ========================================');
    console.log('🏨  Hotel Reservation Platform');
    console.log('🚀 ========================================');
    console.log(`✅  API Gateway démarrée sur le port ${PORT}`);
    console.log(`🌐  Frontend : http://localhost:${PORT}`);
    console.log(`🌐  REST     : http://localhost:${PORT}/api`);
    console.log(`🔷  GraphQL  : http://localhost:${PORT}/graphql`);
    console.log('🚀 ========================================');
    console.log('');
    console.log('👉 Ouvre : http://localhost:3000');
  });
}

startServer().catch(console.error);
