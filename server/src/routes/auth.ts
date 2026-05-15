import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

export async function authRoutes(fastify: FastifyInstance) {
  
  // LOGIN
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body as any;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true }
    });

    if (!user) {
      return reply.code(401).send({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return reply.code(401).send({ message: 'Invalid credentials' });
    }

    const token = fastify.jwt.sign({ 
      id: user.id, 
      email: user.email, 
      role: user.role,
      companyId: user.companyId 
    });

    return { token, user: { id: user.id, email: user.email, company: user.company.name, role: user.role } };
  });

  // REGISTER (New Company + Admin User)
  fastify.post('/register', async (request, reply) => {
    const { companyName, email, password } = request.body as any;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return reply.code(400).send({ message: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create Company & User in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Company
      // slug generation is simple for now, can be improved
      const slug = companyName.toLowerCase().replace(/ /g, '-') + '-' + Date.now();
      
      const company = await tx.company.create({
        data: {
          name: companyName,
          slug: slug
        }
      });

      // 2. Create User linked to Company
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          companyId: company.id,
          role: 'ADMIN'
        }
      });

      return { company, user };
    });

    const token = fastify.jwt.sign({ 
      id: result.user.id, 
      email: result.user.email, 
      role: result.user.role,
      companyId: result.user.companyId 
    });

    return { 
      message: 'Company registered successfully',
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        company: result.company.name,
        role: result.user.role
      }
    };
  });
}
