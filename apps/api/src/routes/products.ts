import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { type ApiResponse, type Product, Metal } from '@shared';

export const productRoutes = async (fastify: FastifyInstance, _options: FastifyPluginOptions) => {
  /**
   * Get all products
   * GET /api/products
   */
  fastify.get('/', async (_request, reply) => {
    // Mock data for now - will be replaced with database queries
    const mockProducts: Product[] = [
      {
        id: '1',
        dealerId: 'dealer-1',
        name: '1 oz Gold American Eagle',
        metal: Metal.GOLD,
        weight: 1,
        price: 2050,
        pricePerOunce: 2050,
        productUrl: 'https://example.com/product/1',
        inStock: true,
        lastUpdated: new Date(),
        premium: 5.2,
      },
      {
        id: '2',
        dealerId: 'dealer-1',
        name: '1 oz Silver American Eagle',
        metal: Metal.SILVER,
        weight: 1,
        price: 28.5,
        pricePerOunce: 28.5,
        productUrl: 'https://example.com/product/2',
        inStock: true,
        lastUpdated: new Date(),
        premium: 15.8,
      },
    ];

    const response: ApiResponse<Product[]> = {
      success: true,
      data: mockProducts,
      timestamp: new Date(),
    };

    reply.send(response);
  });

  /**
   * Get product by ID
   * GET /api/products/:id
   */
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    // Mock data - will be replaced with database query
    const mockProduct: Product = {
      id,
      dealerId: 'dealer-1',
      name: '1 oz Gold American Eagle',
      metal: Metal.GOLD,
      weight: 1,
      price: 2050,
      pricePerOunce: 2050,
      productUrl: 'https://example.com/product/1',
      inStock: true,
      lastUpdated: new Date(),
      premium: 5.2,
    };

    const response: ApiResponse<Product> = {
      success: true,
      data: mockProduct,
      timestamp: new Date(),
    };

    reply.send(response);
  });
};
