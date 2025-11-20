import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { type ApiResponse } from '@shared';
import { healthRoutes } from './routes/health';
import { productRoutes } from './routes/products';

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT) : 4000;
const HOST = process.env.HOST || '0.0.0.0';

/**
 * Create and configure Fastify server
 */
const createServer = async () => {
  const fastify = Fastify({
    logger: {
      transport:
        process.env.NODE_ENV === 'production'
          ? undefined
          : {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            },
    },
  });

  // Register plugins
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Register routes
  await fastify.register(healthRoutes, { prefix: '/health' });
  await fastify.register(productRoutes, { prefix: '/api/products' });

  // Global error handler
  fastify.setErrorHandler((error: any, request, reply) => {
    fastify.log.error(error);

    const response: ApiResponse<null> = {
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date(),
    };

    reply.status(error.statusCode || 500).send(response);
  });

  // 404 handler
  fastify.setNotFoundHandler((request, reply) => {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Route not found',
      timestamp: new Date(),
    };

    reply.status(404).send(response);
  });

  return fastify;
};

/**
 * Start the server
 */
const start = async () => {
  try {
    const fastify = await createServer();

    await fastify.listen({ port: PORT, host: HOST });

    console.log(`
🚀 API Server is running!
📍 URL: http://${HOST}:${PORT}
🏥 Health: http://${HOST}:${PORT}/health
📚 Environment: ${process.env.NODE_ENV || 'development'}
    `);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start the server
start();
