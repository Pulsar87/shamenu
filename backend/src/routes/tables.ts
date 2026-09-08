import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import QRCode from 'qrcode'

const createTableSchema = z.object({
  number: z.string(),
  seats: z.number().int().positive().optional(),
  zone: z.string().optional()
})

/**
 * Register table routes
 */
export async function registerTableRoutes(fastify: FastifyInstance) {
  // Validate table token (public, for guests)
  fastify.get('/api/v1/guest/tables/validate', async (request, reply) => {
    const token = request.headers['x-table-token'] as string
    
    if (!token) {
      return reply.code(400).send({ 
        error: { code: 'MISSING_TOKEN', message: 'Table token required' } 
      })
    }

    const table = await prisma.table.findUnique({
      where: { qrToken: token },
      include: {
        restaurant: true
      }
    })

    if (!table) {
      return reply.code(404).send({ 
        error: { code: 'TABLE_NOT_FOUND', message: 'Invalid table token' } 
      })
    }

    return { 
      table: {
        id: table.id,
        number: table.number,
        zone: table.zone,
        seats: table.seats
      },
      restaurant: {
        id: table.restaurant.id,
        name: table.restaurant.name,
        slug: table.restaurant.slug,
        currency: table.restaurant.currency
      }
    }
  })

  // Get tables for restaurant
  fastify.get('/api/v1/restaurants/:restaurantId/tables', async (request) => {
    const { restaurantId } = request.params as { restaurantId: string }
    
    const tables = await prisma.table.findMany({
      where: { restaurantId },
      orderBy: { number: 'asc' }
    })

    return { tables }
  })

  // Create table
  fastify.post('/api/v1/restaurants/:restaurantId/tables', async (request, reply) => {
    try {
      const { restaurantId } = request.params as { restaurantId: string }
      const body = createTableSchema.parse(request.body)
      
      // Generate unique QR token
      const qrToken = `table-${restaurantId}-${body.number}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const table = await prisma.table.create({
        data: {
          ...body,
          restaurantId,
          qrToken
        }
      })

      return reply.code(201).send({ table })
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ 
          error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.issues } 
        })
      }
      throw error
    }
  })

  // Get table by ID
  fastify.get('/api/v1/tables/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    
    const table = await prisma.table.findUnique({
      where: { id },
      include: {
        restaurant: true,
        orders: {
          orderBy: { placedAt: 'desc' },
          take: 10
        }
      }
    })

    if (!table) {
      return reply.code(404).send({ 
        error: { code: 'NOT_FOUND', message: 'Table not found' } 
      })
    }

    return { table }
  })

  // Update table
  fastify.patch('/api/v1/tables/:id', async (request) => {
    const { id } = request.params as { id: string }
    
    const table = await prisma.table.update({
      where: { id },
      data: request.body as any
    })

    return { table }
  })

  // Delete table
  fastify.delete('/api/v1/tables/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    await prisma.table.delete({
      where: { id }
    })

    return { success: true }
  })

  // Regenerate QR code for table
  fastify.post('/api/v1/tables/:id/regenerate-qr', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    const table = await prisma.table.findUnique({
      where: { id },
      include: { restaurant: true }
    })

    if (!table) {
      return reply.code(404).send({ 
        error: { code: 'NOT_FOUND', message: 'Table not found' } 
      })
    }

    // Generate new QR token
    const qrToken = `table-${table.restaurantId}-${table.number}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const updatedTable = await prisma.table.update({
      where: { id },
      data: { qrToken }
    })

    return { table: updatedTable }
  })

  // Get QR code image for table
  fastify.get('/api/v1/tables/:id/qr', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    const table = await prisma.table.findUnique({
      where: { id },
      include: { restaurant: true }
    })

    if (!table) {
      return reply.code(404).send({ 
        error: { code: 'NOT_FOUND', message: 'Table not found' } 
      })
    }

    // Generate QR code URL (customer will scan this)
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const qrUrl = `${baseUrl}/m/${table.restaurant.slug}/t/${table.qrToken}`
    
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })

      return { 
        qrCode: qrCodeDataUrl,
        qrUrl,
        tableNumber: table.number
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
      return reply.code(500).send({ 
        error: { code: 'QR_GENERATION_FAILED', message: 'Failed to generate QR code' } 
      })
    }
  })
}
