import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';

export async function customerRoutes(fastify: FastifyInstance) {
  
  // Protect all routes in this plugin
  fastify.addHook('preHandler', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // GET / - List customers
  fastify.get('/', async (request, reply) => {
    const user = request.user as any; 
    const { page = 1, limit = 10, search = '' } = request.query as any;
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { companyId: user.companyId };
    
    if (search) {
        where.OR = [
            { name: { contains: search } },
            { email: { contains: search } } // Removed 'mode: insensitive' for MySQL compatibility if needed, though Prisma usually handles it.
        ];
    }

    const [total, customers] = await Promise.all([
        prisma.customer.count({ where }),
        prisma.customer.findMany({
            where,
            orderBy: { id: 'desc' },
            skip,
            take: limitNum
        })
    ]);

    return {
        data: customers,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
    };
  });

  // POST / - Create Customer
  fastify.post('/', async (request, reply) => {
    const user = request.user as any;
    const { name, email, phone, address, city, zipCode, province, country, vatId } = request.body as any;

    if (!name) {
      return reply.code(400).send({ message: 'Name is required' });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address,
        city,
        zipCode,
        province,
        country,
        vatId,
        companyId: user.companyId
      }
    });

    return customer;
  });

  // PUT /:id - Update Customer
  fastify.put('/:id', async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as any;
    const { name, email, phone, address, city, zipCode, province, country, vatId } = request.body as any;

    const existing = await prisma.customer.findFirst({
        where: { id: Number(id), companyId: user.companyId }
    });

    if (!existing) {
        return reply.code(404).send({ message: 'Customer not found' });
    }

    const customer = await prisma.customer.update({
      where: { id: Number(id) },
      data: { name, email, phone, address, city, zipCode, province, country, vatId }
    });

    return customer;
  });

  // DELETE /:id - Delete Customer
  fastify.delete('/:id', async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as any;

    const existing = await prisma.customer.findFirst({
        where: { id: Number(id), companyId: user.companyId }
    });

    if (!existing) {
        return reply.code(404).send({ message: 'Customer not found' });
    }

    await prisma.customer.delete({
      where: { id: Number(id) }
    });

    return { message: 'Customer deleted' };
  });
}
