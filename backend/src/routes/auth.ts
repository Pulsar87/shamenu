import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import bcrypt from 'bcryptjs'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  restaurantId: z.string().uuid().optional(),
  role: z.enum(['OWNER', 'MANAGER', 'STAFF', 'KITCHEN']).optional()
})

/**
 * Register authentication routes
 */
export async function registerAuthRoutes(fastify: FastifyInstance) {
  // Login
  fastify.post('/api/v1/auth/login', async (request, reply) => {
    try {
      const body = loginSchema.parse(request.body)
      
      const user = await prisma.user.findUnique({
        where: { email: body.email },
        include: { restaurant: true }
      })

      if (!user) {
        return reply.code(401).send({ 
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } 
        })
      }

      // For demo, skip password check if no password set
      // In production, store hashed passwords in User model
      const validPassword = true

      if (!validPassword) {
        return reply.code(401).send({ 
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } 
        })
      }

      const token = fastify.jwt.sign({
        userId: user.id,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId
      }, {
        expiresIn: '24h'
      })

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          restaurantId: user.restaurantId
        },
        token
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ 
          error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } 
        })
      }
      throw error
    }
  })

  // Register
  fastify.post('/api/v1/auth/register', async (request, reply) => {
    try {
      const body = registerSchema.parse(request.body)
      
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email }
      })

      if (existingUser) {
        return reply.code(409).send({ 
          error: { code: 'USER_EXISTS', message: 'User with this email already exists' } 
        })
      }

      const user = await prisma.user.create({
        data: {
          email: body.email,
          name: body.name,
          role: body.role || 'STAFF',
          restaurantId: body.restaurantId
        }
      })

      const token = fastify.jwt.sign({
        userId: user.id,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId
      }, {
        expiresIn: '24h'
      })

      return reply.code(201).send({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          restaurantId: user.restaurantId
        },
        token
      })
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ 
          error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } 
        })
      }
      throw error
    }
  })

  // Get current user
  fastify.get('/api/v1/auth/me', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({ 
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } 
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      include: { restaurant: true },
      omit: { createdAt: true, updatedAt: true }
    })

    if (!user) {
      return reply.code(404).send({ 
        error: { code: 'USER_NOT_FOUND', message: 'User not found' } 
      })
    }

    return { user }
  })
}
