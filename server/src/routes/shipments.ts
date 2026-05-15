import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';

// Helper to generate a unique tracking number
async function generateTrackingNumber() {
  const prefix = 'SH';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}${random}`;
}

// Helper to find or create customer
async function findOrCreateCustomer(
    companyId: number, 
    name: string, 
    details: { 
        address?: string; 
        city?: string; 
        zipCode?: string; 
        province?: string; 
        country?: string; 
        email?: string; 
        phone?: string; 
    }
) {
    if (!name) return null;
    
    // Normalize name for search
    const normalizedName = name.trim();
    
    let customer = await prisma.customer.findFirst({
        where: { 
            companyId, 
            name: normalizedName 
        }
    });

    if (!customer) {
        customer = await prisma.customer.create({
            data: {
                companyId,
                name: normalizedName,
                address: details.address,
                city: details.city,
                zipCode: details.zipCode,
                province: details.province,
                country: details.country,
                email: details.email,
                phone: details.phone
            }
        });
    }
    return customer;
}

export async function shipmentRoutes(fastify: FastifyInstance) {
  
  // Protect all routes
  fastify.addHook('preHandler', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // POST /pickup - Register carrier pickup
  fastify.post('/pickup', async (request, reply) => {
    const user = request.user as any;
    const { ids, date } = request.body as any;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return reply.code(400).send({ message: 'No shipments selected' });
    }

    const result = await prisma.shipment.updateMany({
        where: {
            id: { in: ids.map((id: any) => Number(id)) },
            companyId: user.companyId,
            status: 'PENDING'
        },
        data: {
            status: 'IN_TRANSIT',
            scheduledDate: date ? new Date(date) : new Date()
        }
    });

    return { 
        success: true, 
        count: result.count, 
        message: `${result.count} shipments updated to IN_TRANSIT` 
    };
  });

  // GET / - List all shipments
  fastify.get('/', async (request, reply) => {
    const user = request.user as any;
    const { page = 1, limit = 10, search = '', status, carrierId } = request.query as any;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { companyId: user.companyId };

    if (search) {
        where.OR = [
            { trackingNumber: { contains: search } },
            { recipientName: { contains: search } }
        ];
    }

    if (status) {
        where.status = status;
    }

    if (carrierId) {
        where.carrierId = Number(carrierId);
    }

    const [total, shipments] = await Promise.all([
        prisma.shipment.count({ where }),
        prisma.shipment.findMany({
            where,
            include: { customer: true, carrier: true },
            orderBy: { id: 'desc' },
            skip,
            take: limitNum
        })
    ]);

    return {
        data: shipments,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
    };
  });

  // GET /:id - Get single shipment
  fastify.get('/:id', async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as any;

    const shipment = await prisma.shipment.findFirst({
      where: { id: Number(id), companyId: user.companyId },
      include: { customer: true, carrier: true }
    });

    if (!shipment) {
      return reply.code(404).send({ message: 'Shipment not found' });
    }

    return shipment;
  });

  // POST / - Create Shipment
  fastify.post('/', async (request, reply) => {
    const user = request.user as any;
    const data = request.body as any;

    // 1. Handle Sender (Link to Customer ID)
    if (data.senderName) {
        const sender = await findOrCreateCustomer(user.companyId, data.senderName, {
            address: data.senderAddress,
            city: data.senderCity,
            zipCode: data.senderZip,
            province: data.senderProvince,
            country: data.senderCountry,
            email: data.senderEmail,
            phone: data.senderPhone
        });
        if (sender && !data.customerId) {
            data.customerId = sender.id;
        }
    }

    // 2. Handle Recipient (Ensure exists in Address Book)
    if (data.recipientName) {
        await findOrCreateCustomer(user.companyId, data.recipientName, {
            address: data.recipientAddress,
            city: data.recipientCity,
            zipCode: data.recipientZip,
            province: data.recipientProvince,
            country: data.recipientCountry,
            email: data.recipientEmail,
            phone: data.recipientPhone
        });
    }

    // Generate Tracking automatically
    const trackingNumber = await generateTrackingNumber();

    // Calculate Price if Carrier and Weight are present
    let price = 0;
    if (data.carrierId) {
        const carrier = await prisma.carrier.findUnique({ where: { id: Number(data.carrierId) } });
        if (carrier) {
            const weight = data.weight ? Number(data.weight) : 0;
            price = ((carrier as any).basePrice || 0) + (((carrier as any).pricePerKg || 0) * weight);
        }
    }

    const shipment = await prisma.shipment.create({
      data: {
        ...data,
        trackingNumber,
        companyId: user.companyId,
        // Ensure numbers are actually numbers if passed
        weight: data.weight ? Number(data.weight) : undefined,
        packages: data.packages ? Number(data.packages) : undefined,
        price,
        carrierId: data.carrierId ? Number(data.carrierId) : undefined,
        customerId: data.customerId ? Number(data.customerId) : undefined,
        shippingAddress: data.shippingAddress || data.recipientAddress // Fallback to recipient address
      } as any
    });

    return shipment;
  });

  // PUT /:id - Update Shipment (Status, etc)
  fastify.put('/:id', async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as any;
    const data = request.body as any;

    // Check existence
    const existing = await prisma.shipment.findFirst({
        where: { id: Number(id), companyId: user.companyId }
    });

    if (!existing) {
        return reply.code(404).send({ message: 'Shipment not found' });
    }

    // 1. Handle Sender
    if (data.senderName) {
        const sender = await findOrCreateCustomer(user.companyId, data.senderName, {
            address: data.senderAddress,
            city: data.senderCity,
            zipCode: data.senderZip,
            province: data.senderProvince,
            country: data.senderCountry,
            email: data.senderEmail,
            phone: data.senderPhone
        });
        // On update, we might update the customer link if it was null or changed
        if (sender && (!data.customerId || data.customerId !== existing.customerId)) {
             data.customerId = sender.id;
        }
    }

    // 2. Handle Recipient
    if (data.recipientName) {
         await findOrCreateCustomer(user.companyId, data.recipientName, {
            address: data.recipientAddress,
            city: data.recipientCity,
            zipCode: data.recipientZip,
            province: data.recipientProvince,
            country: data.recipientCountry,
            email: data.recipientEmail,
            phone: data.recipientPhone
        });
    }

    // Recalculate price if carrier or weight changes
    let price = (existing as any).price || 0;
    const newCarrierId = data.carrierId ? Number(data.carrierId) : (existing as any).carrierId;
    const newWeight = data.weight ? Number(data.weight) : (existing as any).weight;

    if (newCarrierId && (data.carrierId || data.weight)) {
         const carrier = await prisma.carrier.findUnique({ where: { id: newCarrierId } });
         if (carrier) {
             price = ((carrier as any).basePrice || 0) + (((carrier as any).pricePerKg || 0) * (newWeight || 0));
         }
    }

    const shipment = await prisma.shipment.update({
      where: { id: Number(id) },
      data: {
        ...data,
        weight: data.weight ? Number(data.weight) : undefined,
        packages: data.packages ? Number(data.packages) : undefined,
        price,
        carrierId: data.carrierId ? Number(data.carrierId) : undefined,
        customerId: data.customerId ? Number(data.customerId) : undefined,
        shippingAddress: data.shippingAddress || data.recipientAddress
      } as any
    });

    return shipment;
  });

  // DELETE /:id
  fastify.delete('/:id', async (request, reply) => {
    const user = request.user as any;
    const { id } = request.params as any;

    const existing = await prisma.shipment.findFirst({
        where: { id: Number(id), companyId: user.companyId }
    });

    if (!existing) {
        return reply.code(404).send({ message: 'Shipment not found' });
    }

    await prisma.shipment.delete({
      where: { id: Number(id) }
    });

    return { message: 'Shipment deleted' };
  });
}
