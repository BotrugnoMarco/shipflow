import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { prisma } from './lib/prisma';
import { authRoutes } from './routes/auth';
import { customerRoutes } from './routes/customers';
import { shipmentRoutes } from './routes/shipments';
import { carrierRoutes } from './routes/carriers';

const fastify = Fastify({
  logger: true
});

// Register JWT
fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecret_change_me_in_prod'
});

fastify.register(cors, {
  origin: ['https://shipflow.botrugno.dev', 'http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true
});

// Register Routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(customerRoutes, { prefix: '/api/customers' });
fastify.register(shipmentRoutes, { prefix: '/api/shipments' });
fastify.register(carrierRoutes, { prefix: '/api/carriers' });

fastify.get('/', async (request, reply) => {
  return { hello: 'world', system: 'ShipFlow' };
});

// Example route to get all companies
fastify.get('/companies', async (request, reply) => {
  const companies = await prisma.company.findMany();
  return companies;
});

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
