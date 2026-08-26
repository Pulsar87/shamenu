import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

const createCategorySchema = z.object({
  name: z.string().min(1),
  sortOrder: z.number().int().optional(),
  image: z.string().url().optional()
})

const createMenuItemSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  priceCents: z.number().int().positive(),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  allergens: z.array(z.string()).optional(),
  prepTimeMin: z.number().int().positive().optional(),
  sortOrder: z.number().int().optional(),
  variants: z.any().optional()
})

/**
 * Register menu routes (categories and menu items)
 */
export async function registerMenuRoutes(fastify: FastifyInstance) {
  // Get restaurant menu (public)
  fastify.get('/api/v1/public/restaurants/:slug/menu', async (request, reply) => {
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

    return { menu: restaurant.categories }
  })

  // Create category
  fastify.post('/api/v1/restaurants/:restaurantId/categories', async (request, reply) => {
    try {
      const { restaurantId } = request.params as { restaurantId: string }
      const body = createCategorySchema.parse(request.body)
      
      const category = await prisma.category.create({
        data: {
          ...body,
          restaurantId
        }
      })

      return reply.code(201).send({ category })
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ 
          error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } 
        })
      }
      throw error
    }
  })

  // Get categories for restaurant
  fastify.get('/api/v1/restaurants/:restaurantId/categories', async (request, reply) => {
    const { restaurantId } = request.params as { restaurantId: string }
    
    const categories = await prisma.category.findMany({
      where: { restaurantId },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { menuItems: true }
        }
      }
    })

    return { categories }
  })

  // Update category
  fastify.patch('/api/v1/categories/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    const category = await prisma.category.update({
      where: { id },
      data: request.body as any
    })

    return { category }
  })

  // Delete category
  fastify.delete('/api/v1/categories/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    await prisma.category.delete({
      where: { id }
    })

    return { success: true }
  })

  // Create menu item
  fastify.post('/api/v1/restaurants/:restaurantId/items', async (request, reply) => {
    try {
      const body = createMenuItemSchema.parse(request.body)
      
      const menuItem = await prisma.menuItem.create({
        data: {
          ...body,
          restaurantId: body.categoryId // Will be set via category relation
        }
      })

      return reply.code(201).send({ menuItem })
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ 
          error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } 
        })
      }
      throw error
    }
  })

  // Get menu items for restaurant
  fastify.get('/api/v1/restaurants/:restaurantId/items', async (request, reply) => {
    const { restaurantId } = request.params as { restaurantId: string }
    
    const menuItems = await prisma.menuItem.findMany({
      where: { restaurantId },
      orderBy: { sortOrder: 'asc' },
      include: {
        category: true
      }
    })

    return { menuItems }
  })

  // Get menu item by ID
  fastify.get('/api/v1/items/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true
      }
    })

    if (!menuItem) {
      return reply.code(404).send({ 
        error: { code: 'NOT_FOUND', message: 'Menu item not found' } 
      })
    }

    return { menuItem }
  })

  // Update menu item
  fastify.patch('/api/v1/items/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: request.body as any
    })

    return { menuItem }
  })

  // Delete menu item
  fastify.delete('/api/v1/items/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    await prisma.menuItem.delete({
      where: { id }
    })

    return { success: true }
  })

  // Toggle item availability
  fastify.patch('/api/v1/items/:id/availability', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { isAvailable } = request.body as { isAvailable: boolean }
    
    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: { isAvailable }
    })

    return { menuItem }
  })
}
