import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';

export async function carrierRoutes(fastify: FastifyInstance) {
  
  // Protect
  fastify.addHook('preHandler', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // GET /
  fastify.get('/', async (request, reply) => {
    const user = request.user as any;
    const carriers = await prisma.carrier.findMany({
      where: { companyId: user.companyId },
      orderBy: { id: 'desc' }
    });
    return carriers;
  });

  // GET /:id
  fastify.get('/:id', async (request, reply) => {
      const user = request.user as any;
      const { id } = request.params as any;
      const carrier = await prisma.carrier.findFirst({
          where: { id: Number(id), companyId: user.companyId }
      });
      if (!carrier) return reply.code(404).send({ message: 'Carrier not found' });
      return carrier;
  });

  // POST /
  fastify.post('/', async (request, reply) => {
      const user = request.user as any;
      if (user.role !== 'ADMIN') {
        return reply.code(403).send({ message: 'Forbidden: Admins only' });
      }
      const data = request.body as any;
      
      const carrier = await prisma.carrier.create({
          data: {
              ...data,
              basePrice: data.basePrice ? Number(data.basePrice) : 0,
              pricePerKg: data.pricePerKg ? Number(data.pricePerKg) : 0,
              companyId: user.companyId
          } as any
      });
      return carrier;
  });

  // PUT /:id
  fastify.put('/:id', async (request, reply) => {
      const user = request.user as any;
      const { id } = request.params as any;
      const data = request.body as any;

      const existing = await prisma.carrier.findFirst({
        where: { id: Number(id), companyId: user.companyId }
      });
      if (!existing) return reply.code(404).send({ message: 'Carrier not found' });

      // If NOT admin, force strict whitelist of allowed fields
      let updateData = { ...data };
      if (user.role !== 'ADMIN') {
         // Operator can only update prices
         updateData = {
             basePrice: data.basePrice,
             pricePerKg: data.pricePerKg
         };
         // Ensure no other sensitive fields are touched implicitly
      }

      const updated = await prisma.carrier.update({
          where: { id: Number(id) },
          data: {
              ...updateData,
              // Ensure numeric conversion safe
              basePrice: updateData.basePrice ? Number(updateData.basePrice) : (existing as any).basePrice,
              pricePerKg: updateData.pricePerKg ? Number(updateData.pricePerKg) : (existing as any).pricePerKg,
          } as any
      });
      return updated;
  });

  // DELETE /:id
  fastify.delete('/:id', async (request, reply) => {
      const user = request.user as any;
      if (user.role !== 'ADMIN') {
        return reply.code(403).send({ message: 'Forbidden: Admins only' });
      }
      const { id } = request.params as any;
      
      const existing = await prisma.carrier.findFirst({
        where: { id: Number(id), companyId: user.companyId }
      });
      if (!existing) return reply.code(404).send({ message: 'Carrier not found' });

      // Check if used in shipments?
      const usage = await prisma.shipment.findFirst({ where: { carrierId: Number(id) }});
      if (usage) {
          return reply.code(400).send({ message: 'Cannot delete carrier used in shipments' });
      }

      await prisma.carrier.delete({ where: { id: Number(id) } });
      return { success: true };
  });
}
