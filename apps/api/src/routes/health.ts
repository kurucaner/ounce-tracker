import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { type ApiResponse } from '@shared';

interface HealthCheckResponse {
  status: string;
  uptime: number;
  timestamp: Date;
  environment: string;
}

export const healthRoutes = async (fastify: FastifyInstance, _options: FastifyPluginOptions) => {
  /**
   * Health check endpoint
   * GET /health
   */
  fastify.get('/', async (_request, reply) => {
    const response: ApiResponse<HealthCheckResponse> = {
      success: true,
      data: {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development',
      },
      timestamp: new Date(),
    };

    reply.send(response);
  });

  /**
   * Ready check endpoint
   * GET /health/ready
   */
  fastify.get('/ready', async (_request, reply) => {
    // Add checks for database, redis, etc. when implemented
    const isReady = true;

    if (isReady) {
      const response: ApiResponse<{ ready: boolean }> = {
        success: true,
        data: { ready: true },
        timestamp: new Date(),
      };
      reply.send(response);
    } else {
      reply.status(503).send({
        success: false,
        error: 'Service not ready',
        timestamp: new Date(),
      });
    }
  });

  /**
   * Live check endpoint
   * GET /health/live
   */
  fastify.get('/live', async (_request, reply) => {
    const response: ApiResponse<{ alive: boolean }> = {
      success: true,
      data: { alive: true },
      timestamp: new Date(),
    };
    reply.send(response);
  });
};
