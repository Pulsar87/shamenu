import type { Order } from '../lib/api'
import { useWebSocket } from '../hooks/useWebSocket'

interface KDSBoardProps {
  restaurantId: string
  orders: Order[]
  onUpdateStatus: (orderId: string, status: Order['status']) => void
}

export function KDSBoard({ restaurantId, orders, onUpdateStatus }: KDSBoardProps) {
  const handleWSMessage = (event: any) => {
    console.log('[KDS] Received WS event:', event)
    // Orders will be refreshed via polling or parent component
  }

  const { isConnected } = useWebSocket({
    channel: `kds:${restaurantId}`,
    onMessage: handleWSMessage
  })

  const columns: Order['status'][] = ['PLACED', 'PREPARING', 'READY', 'DELIVERED']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLACED': return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300'
      case 'PREPARING': return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300'
      case 'READY': return 'bg-green-100 dark:bg-green-900/30 border-green-300'
      case 'DELIVERED': return 'bg-gray-100 dark:bg-gray-800 border-gray-300'
      default: return 'bg-gray-50'
    }
  }

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    const currentIndex = columns.indexOf(currentStatus)
    if (currentIndex < columns.length - 1) {
      return columns[currentIndex + 1]
    }
    return null
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Kitchen Display System</h2>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(status => {
          const statusOrders = orders.filter(o => o.status === status)
          const nextStatus = getNextStatus(status)

          return (
            <div key={status} className="space-y-3">
              <div className={`p-3 rounded-lg border ${getStatusColor(status)}`}>
                <h3 className="font-semibold">{status}</h3>
                <span className="text-sm text-muted-foreground">{statusOrders.length} orders</span>
              </div>

              <div className="space-y-3 min-h-[200px]">
                {statusOrders.map(order => {
                  const placedAt = new Date(order.placedAt)
                  const minutesAgo = Math.floor((Date.now() - placedAt.getTime()) / 60000)
                  const isUrgent = status === 'PLACED' && minutesAgo > 3

                  return (
                    <div
                      key={order.id}
                      className={`p-4 bg-card rounded-lg shadow border-l-4 ${
                        isUrgent ? 'border-l-red-500 animate-pulse' : 'border-l-primary'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Table {order.table?.number}</p>
                          <p className="text-xs text-muted-foreground">
                            {minutesAgo} min ago
                          </p>
                        </div>
                        <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          #{order.id.slice(0, 6)}
                        </span>
                      </div>

                      <div className="space-y-1 mb-3">
                        {(order.items as any[]).map((item, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="font-medium">{item.quantity}x</span>{' '}
                            {item.menuItem?.name || item.name}
                            {item.specialInstructions && (
                              <p className="text-xs text-destructive italic">
                                Note: {item.specialInstructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {nextStatus && (
                        <button
                          onClick={() => onUpdateStatus(order.id, nextStatus)}
                          className="w-full bg-primary text-primary-foreground py-2 rounded-md text-sm hover:bg-primary/90 transition-colors"
                        >
                          Mark {nextStatus}
                        </button>
                      )}
                    </div>
                  )
                })}

                {statusOrders.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                    No orders
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
