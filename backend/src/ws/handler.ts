import { FastifyInstance } from 'fastify'
import WebSocket from 'ws'

interface WSClient extends WebSocket {
  restaurantId?: string
  tableToken?: string
  userId?: string
}

type WSChannel = `kds:${string}` | `table:${string}` | `admin:${string}`

interface WSEvent {
  type: string
  orderId?: string
  status?: string
  ts: number
  data?: any
}

/**
 * WebSocket handler for real-time updates
 */
export async function wsHandler(fastify: FastifyInstance) {
  const clients = new Map<string, Set<WSClient>>()

  fastify.get('/ws', { websocket: true }, (ws, req) => {
    const url = new URL(req.url || '', 'http://localhost')
    const channel = url.searchParams.get('channel')

    if (!channel) {
      ws.close(1008, 'Missing channel parameter')
      return
    }

    // Validate channel format
    const [channelType, channelId] = channel.split(':')
    if (!['kds', 'table', 'admin'].includes(channelType) || !channelId) {
      ws.close(1008, 'Invalid channel format')
      return
    }

    console.log(`[WS] Client connected to ${channel}`)

    // Add client to channel
    if (!clients.has(channel)) {
      clients.set(channel, new Set())
    }
    clients.get(channel)!.add(ws)

    // Send initial snapshot request
    ws.send(JSON.stringify({ type: 'connected', channel }))

    ws.on('message', async (message: Buffer) => {
      try {
        const event = JSON.parse(message.toString()) as WSEvent
        console.log(`[WS] Received event:`, event.type)
        
        // Handle client events if needed
        switch (event.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', ts: Date.now() }))
            break
        }
      } catch (error) {
        console.error('[WS] Error processing message:', error)
      }
    })

    ws.on('close', () => {
      console.log(`[WS] Client disconnected from ${channel}`)
      clients.get(channel)?.delete(ws)
      
      // Clean up empty channels
      if (clients.get(channel)?.size === 0) {
        clients.delete(channel)
      }
    })

    ws.on('error', (error: Error) => {
      console.error('[WS] Connection error:', error)
    })

    // Heartbeat
    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping', ts: Date.now() }))
      } else {
        clearInterval(heartbeat)
      }
    }, 30000)

    ws.on('close', () => clearInterval(heartbeat))
  })

  // Helper function to broadcast events to a channel
  fastify.decorate('broadcastToChannel', (channel: WSChannel, event: WSEvent) => {
    const channelClients = clients.get(channel)
    if (!channelClients) return

    const message = JSON.stringify(event)
    channelClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    })
  })

  // Decorate fastify instance with broadcast function
  fastify.decorate('broadcastOrderUpdate', (restaurantId: string, orderId: string, status: string) => {
    const kdsEvent: WSEvent = {
      type: 'order.status_changed',
      orderId,
      status,
      ts: Date.now()
    }
    
    const adminEvent: WSEvent = {
      ...kdsEvent,
      type: 'order.updated'
    }

    // Broadcast to KDS channel
    const kdsChannel = `kds:${restaurantId}`
    const kdsClients = clients.get(kdsChannel)
    kdsClients?.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(kdsEvent))
      }
    })

    // Broadcast to admin channel
    const adminChannel = `admin:${restaurantId}`
    const adminClients = clients.get(adminChannel)
    adminClients?.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(adminEvent))
      }
    })
  })

  fastify.decorate('broadcastTableUpdate', (tableToken: string, orderId: string, status: string) => {
    const event: WSEvent = {
      type: 'order.status_changed',
      orderId,
      status,
      ts: Date.now()
    }

    const channel = `table:${tableToken}`
    const channelClients = clients.get(channel)
    channelClients?.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(event))
      }
    })
  })
}

declare module 'fastify' {
  interface FastifyInstance {
    broadcastToChannel(channel: WSChannel, event: WSEvent): void
    broadcastOrderUpdate(restaurantId: string, orderId: string, status: string): void
    broadcastTableUpdate(tableToken: string, orderId: string, status: string): void
  }
}
