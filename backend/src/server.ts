import Fastify from 'fastify'
import cors from '@fastify/cors'
import websocket from '@fastify/websocket'
import { wsHandler } from './ws/handler.js'
import { authMiddleware } from './middleware/auth.js'
import { prisma } from './lib/prisma.js'

// Import routes (will be created)
import { registerRestaurantRoutes } from './routes/restaurants.js'
import { registerMenuRoutes } from './routes/menu.js'
import { registerOrderRoutes } from './routes/orders.js'
import { registerTableRoutes } from './routes/tables.js'
import { registerAuthRoutes } from './routes/auth.js'

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
})

async function bootstrap() {
  // Register plugins
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Table-Token']
  })

  await fastify.register(websocket)

  // Register WebSocket handler
  await fastify.register(wsHandler)

  // Register authentication middleware
  await fastify.register(authMiddleware)

  // Health check endpoints
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  fastify.get('/ready', async () => {
    try {
      await prisma.$queryRaw`SELECT 1`
      return { status: 'ready', database: 'connected' }
    } catch (error) {
      throw new Error('Database connection failed')
    }
  })

  // Register API routes
  await registerAuthRoutes(fastify)
  await registerRestaurantRoutes(fastify)
  await registerMenuRoutes(fastify)
  await registerOrderRoutes(fastify)
  await registerTableRoutes(fastify)

  const port = parseInt(process.env.PORT || '3001', 10)
  const host = process.env.HOST || '0.0.0.0'

  try {
    await fastify.listen({ port, host })
    console.log(`🚀 Server running at http://${host}:${port}`)
    console.log(`📡 WebSocket endpoint: ws://${host}:${port}/ws`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

bootstrap()

export { fastify }
