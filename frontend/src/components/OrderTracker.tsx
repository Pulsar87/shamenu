import type { Order } from '../lib/api'

interface OrderTrackerProps {
  order: Order
}

const statusSteps = ['PLACED', 'PREPARING', 'READY', 'DELIVERED']

export function OrderTracker({ order }: OrderTrackerProps) {
  const currentIndex = statusSteps.indexOf(order.status)

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Order Status</h2>

      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-4 left-0 right-0 h-1 bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(currentIndex / (statusSteps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Status steps */}
        <div className="relative flex justify-between">
          {statusSteps.map((status, index) => {
            const isCompleted = index <= currentIndex
            const isCurrent = index === currentIndex

            return (
              <div key={status} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-background border-secondary text-muted-foreground'
                  } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  isCurrent ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {status}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">Order Details</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-mono">{order.id.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Table</span>
            <span>{order.table?.number || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span>${(order.totalCents / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time</span>
            <span>{new Date(order.placedAt).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {order.status === 'DELIVERED' && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-green-700 dark:text-green-400 text-center font-medium">
            Enjoy your meal! 🍽️
          </p>
        </div>
      )}
    </div>
  )
}
