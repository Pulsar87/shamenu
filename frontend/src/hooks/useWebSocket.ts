import { useState, useEffect, useCallback, useRef } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws'

export interface WSEvent {
  type: string
  orderId?: string
  status?: string
  ts: number
  data?: any
}

interface UseWebSocketOptions {
  channel: string
  onMessage?: (event: WSEvent) => void
  reconnectAttempts?: number
}

export function useWebSocket({ channel, onMessage, reconnectAttempts = 5 }: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectCountRef = useRef(0)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      const ws = new WebSocket(`${WS_URL}?channel=${encodeURIComponent(channel)}`)

      ws.onopen = () => {
        console.log('[WS] Connected to', channel)
        setIsConnected(true)
        reconnectCountRef.current = 0
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WSEvent

          if (data.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong', ts: Date.now() }))
            return
          }

          if (data.type === 'connected') {
            console.log('[WS] Registered on channel:', channel)
            return
          }

          onMessage?.(data)
        } catch (error) {
          console.error('[WS] Error parsing message:', error)
        }
      }

      ws.onclose = () => {
        console.log('[WS] Disconnected from', channel)
        setIsConnected(false)

        // Attempt reconnection with exponential backoff
        if (reconnectCountRef.current < reconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectCountRef.current), 30000)
          console.log(`[WS] Reconnecting in ${delay}ms (attempt ${reconnectCountRef.current + 1}/${reconnectAttempts})`)

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectCountRef.current++
            connect()
          }, delay)
        } else {
          console.error('[WS] Max reconnection attempts reached')
        }
      }

      ws.onerror = (error) => {
        console.error('[WS] Error:', error)
      }

      wsRef.current = ws
    } catch (error) {
      console.error('[WS] Failed to create WebSocket:', error)
    }
  }, [channel, onMessage, reconnectAttempts])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connect])

  const send = useCallback((event: WSEvent) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(event))
    } else {
      console.warn('[WS] Cannot send message - not connected')
    }
  }, [])

  return { isConnected, send, connect }
}
