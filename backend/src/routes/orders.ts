import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

const createOrderSchema = z.object({
  tableToken: z.string(),
  items: z.array(z.object({
    menuItemId: z.string().uuid(),
    quantity: z.number().int().positive(),
    modifiers: z.array(z.object({
      name: z.string(),
      extraPriceCents: z.number().int().optional()
    })).optional(),
    specialInstructions: z.string().optional()
  })),
  notes: z.string().optional(),
  tipCents: z.number().int().min(0).optional()
})

/**
 * Register order routes
 */
export async function registerOrderRoutes(fastify: FastifyInstance) {
  // Create order (guest/staff)
  fastify.post('/api/v1/guest/orders', async (request, reply) => {
    try {
      const body = createOrderSchema.parse(request.body)
      
      // Find table by token
      const table = await prisma.table.findUnique({
        where: { qrToken: body.tableToken },
        include: { restaurant: true }
      })

      if (!table) {
        return reply.code(404).send({ 
          error: { code: 'TABLE_NOT_FOUND', message: 'Invalid table token' } 
        })
      }

      // Calculate totals
      let subtotalCents = 0

      for (const item of body.items) {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId }
        })

        if (!menuItem) {
          return reply.code(404).send({ 
            error: { code: 'ITEM_NOT_FOUND', message: `Menu item ${item.menuItemId} not found` } 
          })
        }

        if (!menuItem.isAvailable) {
          return reply.code(400).send({ 
            error: { code: 'ITEM_UNAVAILABLE', message: `${menuItem.name} is not available` } 
          })
        }

        const modifierTotal = item.modifiers?.reduce((sum, m) => sum + (m.extraPriceCents || 0), 0) || 0
        const lineTotal = (menuItem.priceCents + modifierTotal) * item.quantity
        subtotalCents += lineTotal
      }

      const taxRate = (table.restaurant.settings as any)?.taxRate || 0.08
      const taxCents = Math.round(subtotalCents * taxRate)
      const tipCents = body.tipCents || 0
      const totalCents = subtotalCents + taxCents + tipCents

      // Create order
      const order = await prisma.order.create({
        data: {
          restaurantId: table.restaurantId,
          tableId: table.id,
          status: 'PLACED',
          items: body.items,
          notes: body.notes,
          subtotalCents,
          taxCents,
          tipCents,
          totalCents
        },
        include: {
          table: true,
          restaurant: true
        }
      })

      // Broadcast to KDS via WebSocket
      fastify.broadcastOrderUpdate(table.restaurantId, order.id, 'PLACED')

      return reply.code(201).send({ order })
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ 
          error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.issues } 
        })
      }
      console.error('Error creating order:', error)
      throw error
    }
  })

  // Get order by ID
  fastify.get('/api/v1/orders/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
        restaurant: true,
        orderItems: {
          include: {
            menuItem: true
          }
        }
      }
    })

    if (!order) {
      return reply.code(404).send({ 
        error: { code: 'NOT_FOUND', message: 'Order not found' } 
      })
    }

    return { order }
  })

  // Get orders for restaurant (staff)
  fastify.get('/api/v1/restaurants/:restaurantId/orders', async (request) => {
    const { restaurantId } = request.params as { restaurantId: string }
    const { status, limit = '50' } = request.query as { status?: string, limit?: string }
    
    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        ...(status && { status: status as any })
      },
      orderBy: { placedAt: 'desc' },
      take: parseInt(limit, 10),
      include: {
        table: true,
        orderItems: {
          include: {
            menuItem: true
          }
        }
      }
    })

    return { orders }
  })

  // Update order status
  fastify.patch('/api/v1/orders/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { status } = request.body as { status: string }
    
    const validStatuses = ['PLACED', 'PREPARING', 'READY', 'DELIVERED', 'PAID', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return reply.code(400).send({ 
        error: { code: 'INVALID_STATUS', message: 'Invalid order status' } 
      })
    }

    const order = await prisma.order.update({
      where: { id },
      data: { 
        status: status as any,
        kitchenConfirmedAt: status === 'PREPARING' ? new Date() : undefined
      },
      include: {
        table: true,
        restaurant: true
      }
    })

    // Broadcast status change via WebSocket
    if (order.restaurantId) {
      fastify.broadcastOrderUpdate(order.restaurantId, order.id, status)
    }

    // Broadcast to table guest
    if (order.table) {
      fastify.broadcastTableUpdate(order.table.qrToken, order.id, status)
    }

    return { order }
  })

  // Create payment intent for order
  fastify.post('/api/v1/orders/:id/payment-intent', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: { restaurant: true }
    })

    if (!order) {
      return reply.code(404).send({ 
        error: { code: 'NOT_FOUND', message: 'Order not found' } 
      })
    }

    // TODO: Implement Stripe payment intent creation
    // For now, return mock data
    return {
      clientSecret: 'mock_client_secret_' + id,
      amount: order.totalCents,
      currency: order.restaurant?.currency || 'usd'
    }
  })

  // Cancel order
  fastify.delete('/api/v1/orders/:id', async (request) => {
    const { id } = request.params as { id: string }
    
    const order = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' }
    })

    // Broadcast cancellation
    if (order.restaurantId) {
      fastify.broadcastOrderUpdate(order.restaurantId, order.id, 'CANCELLED')
    }

    return { order }
  })
}
