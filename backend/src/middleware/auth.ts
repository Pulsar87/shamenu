import { FastifyInstance, FastifyRequest } from 'fastify'

interface UserData {
  id: string
  email: string
  role: string
  restaurantId: string | null
}

declare module 'fastify' {
  interface FastifyInstance {
    jwt: import('@fastify/jwt').JWT
  }
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: UserData
}

export async function authMiddleware(fastify: FastifyInstance) {
  // Register JWT plugin
  await fastify.register(import('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production'
  })
  
  // Add authentication hook
  fastify.addHook('preHandler', async (request, reply) => {
    // Skip auth for public routes
    if (request.url.startsWith('/api/v1/public') || 
        request.url.startsWith('/api/v1/guest') ||
        request.url === '/api/v1/auth/login' ||
        request.url === '/api/v1/auth/register') {
      return
    }

    const authHeader = request.headers.authorization

    if (!authHeader) {
      // Allow guest/table token access for certain routes
      if (request.url.includes('/tables/validate') || request.url.includes('/orders')) {
        const tableToken = request.headers['x-table-token']
        if (tableToken) {
          // Validate table token later in route handler
          return
        }
      }
      
      // Require auth for other routes
      reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Missing authorization header' } })
      return
    }

    try {
      const [type, token] = authHeader.split(' ')
      
      if (type !== 'Bearer' || !token) {
        reply.code(401).send({ error: { code: 'INVALID_TOKEN', message: 'Invalid authorization format' } })
        return
      }

      // Verify JWT token
      const decoded = await fastify.jwt.verify(token) as {
        userId: string
        email: string
        role: string
        restaurantId: string | null
      }
      
      if (!decoded || !decoded.userId) {
        reply.code(401).send({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } })
        return
      }

      // Attach user to request
      request.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        restaurantId: decoded.restaurantId
      }
    } catch (error) {
      reply.code(401).send({ error: { code: 'TOKEN_VERIFICATION_FAILED', message: 'Invalid token' } })
    }
  })
}
