import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { KDSBoard } from '../../components/KDSBoard'
import { getOrderApi, updateOrderStatusApi } from '../../lib/api'
import type { Order } from '../../lib/api'

interface ChefViewProps {
  restaurantId: string
}

export function ChefView({ restaurantId: propRestaurantId }: ChefViewProps) {
  const { restaurantId: paramRestaurantId } = useParams<{ restaurantId: string }>()
  const restaurantId = propRestaurantId || paramRestaurantId || ''
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!restaurantId) return
    
    const fetchOrders = async () => {
      try {
        const data = await getOrderApi(restaurantId)
        setOrders(data)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [restaurantId])

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatusApi(orderId, status)
      // Optimistic update
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    } catch (error) {
      console.error('Failed to update order status:', error)
      alert('Failed to update order status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading kitchen orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <KDSBoard 
        restaurantId={restaurantId} 
        orders={orders} 
        onUpdateStatus={handleUpdateStatus} 
      />
    </div>
  )
}
