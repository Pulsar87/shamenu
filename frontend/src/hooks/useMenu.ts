import { useState, useEffect } from 'react'
import type { Category } from '../lib/api'
import { api } from '../lib/api'

export function useMenu(slug: string) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMenu() {
      try {
        setLoading(true)
        const { menu } = await api.getMenu(slug)
        setCategories(menu)
        setError(null)
      } catch (err: any) {
        setError(err.message || 'Failed to load menu')
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [slug])

  return { categories, loading, error }
}

export function useRestaurantOrders(restaurantId: string) {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true)
        const { orders } = await api.getRestaurantOrders(restaurantId)
        setOrders(orders)
        setError(null)
      } catch (err: any) {
        setError(err.message || 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [restaurantId])

  const updateOrderStatus = async (orderId: string, status: any) => {
    const { order } = await api.updateOrderStatus(orderId, status)
    setOrders(prev => prev.map(o => o.id === orderId ? order : o))
    return order
  }

  return { orders, loading, error, updateOrderStatus }
}
