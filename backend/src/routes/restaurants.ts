import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

const createRestaurantSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional()
})

/**
 * Register restaurant routes
 */
export async function registerRestaurantRoutes(fastify: FastifyInstance) {
  // Get restaurant by slug (public)
  fastify.get('/api/v1/public/restaurants/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string }
    
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      include: {
        categories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            menuItems: {
              where: { isAvailable: true },
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      }
    })

    if (!restaurant) {
      return reply.code(404).send({ 
        error: { code: 'NOT_FOUND', message: 'Restaurant not found' } 
      })
    }

    return { restaurant }
  })

  // Get all restaurants (for admin)
  fastify.get('/api/v1/restaurants', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({ 
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } 
      })
    }

    const restaurants = await prisma.restaurant.findMany({
      where: request.user.role === 'OWNER' ? {} : {
        users: { some: { id: request.user.id } }
      },
      include: {
        _count: {
          select: {
            menuItems: true,
            tables: true,
            orders: true
          }
        }
      }
    })

    return { restaurants }
  })

  // Create restaurant
  fastify.post('/api/v1/restaurants', async (request, reply) => {
    if (!request.user || request.user.role !== 'OWNER') {
      return reply.code(403).send({ 
        error: { code: 'FORBIDDEN', message: 'Only owners can create restaurants' } 
      })
    }

    try {
      const body = createRestaurantSchema.parse(request.body)
      
      const existing = await prisma.restaurant.findUnique({
        where: { slug: body.slug }
      })

      if (existing) {
        return reply.code(409).send({ 
          error: { code: 'SLUG_EXISTS', message: 'Restaurant with this slug already exists' } 
        })
      }

      const restaurant = await prisma.restaurant.create({
        data: {
          ...body,
          users: {
            create: {
              id: request.user.id,
              role: 'OWNER'
            }
          }
        },
        include: {
          _count: {
            select: {
              menuItems: true,
              tables: true
            }
          }
        }
      })

      return reply.code(201).send({ restaurant })
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ 
          error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.issues } 
        })
      }
      throw error
    }
  })

  // Get restaurant by ID
  fastify.get('/api/v1/restaurants/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        categories: {
          orderBy: { sortOrder: 'asc' }
        },
        tables: {
          orderBy: { number: 'asc' }
        },
        _count: {
          select: {
            menuItems: true,
            orders: true,
            reviews: true
          }
        }
      }
    })

    if (!restaurant) {
      return reply.code(404).send({ 
        error: { code: 'NOT_FOUND', message: 'Restaurant not found' } 
      })
    }

    return { restaurant }
  })

  // Update restaurant
  fastify.patch('/api/v1/restaurants/:id', async (request) => {
    const { id } = request.params as { id: string }
    
    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: request.body as any
    })

    return { restaurant }
  })
}
