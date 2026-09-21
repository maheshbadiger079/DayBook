const app = require('./app');
const config = require('./config/env');
const { testConnection } = require('./config/db');

const PORT = config.port;

const startServer = async () => {
  try {
    console.log('====================================================');
    console.log('            🚀 Starting WorkTrack API Server        ');
    console.log('====================================================');

    // Test PostgreSQL database connectivity
    console.log('[PostgreSQL]: Verifying database connection...');
    const dbStatus = await testConnection();

    if (!dbStatus.connected) {
      console.warn('⚠️ [PostgreSQL Warning]: Database connection check failed.');
      console.warn('⚠️ Check your .env configuration (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD).');
    } else {
      console.log('✅ [PostgreSQL]: Database connection established successfully!');
    }

    // Start Express HTTP Server
    const server = app.listen(PORT, () => {
      console.log(`✅ [WorkTrack Server]: Running on http://localhost:${PORT}`);
      console.log(`✅ [API Health Endpoint]: http://localhost:${PORT}/api/health`);
      console.log(`✅ [API Info Endpoint]: http://localhost:${PORT}/api`);
      console.log(`✅ [Environment]: ${config.nodeEnv}`);
      console.log('====================================================');
    });

    // Graceful Shutdown handling
    const shutdown = (signal) => {
      console.log(`\n[Shutdown]: Received ${signal}. Closing HTTP server and database pool...`);
      server.close(() => {
        console.log('[Shutdown]: HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ [Fatal Error]: Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
