const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

export interface MenuItem {
  id: string
  categoryId: string
  restaurantId: string
  name: string
  description?: string
  priceCents: number
  imageUrl?: string
  isAvailable: boolean
  isFeatured: boolean
  allergens: string[]
  prepTimeMin?: number
  sortOrder: number
  variants?: any
}

export interface Category {
  id: string
  restaurantId: string
  name: string
  sortOrder: number
  image?: string
  menuItems?: MenuItem[]
}

export interface CartItem {
  menuItem: MenuItem
  quantity: number
  modifiers?: { name: string; extraPriceCents: number }[]
  specialInstructions?: string
  lineTotalCents: number
}

export interface Order {
  id: string
  restaurantId: string
  tableId?: string
  status: 'PLACED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'PAID' | 'CANCELLED'
  items: any[]
  notes?: string
  subtotalCents: number
  taxCents: number
  tipCents: number
  totalCents: number
  placedAt: string
  updatedAt: string
  kitchenConfirmedAt?: string
  table?: {
    id: string
    number: string
    qrToken: string
  }
}

export interface Restaurant {
  id: string
  name: string
  slug: string
  timezone: string
  currency: string
  logo?: string
  coverImage?: string
}

export interface TableValidationResult {
  table: {
    id: string
    number: string
    zone?: string
    seats?: number
  }
  restaurant: Restaurant
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }))
    throw new Error(error.error?.message || 'Request failed')
  }
  return response.json()
}

export const api = {
  // Public menu endpoints
  async getMenu(slug: string): Promise<{ menu: Category[] }> {
    const response = await fetch(`${API_URL}/public/restaurants/${slug}/menu`)
    return handleResponse(response)
  },

  // Guest endpoints
  async validateTable(token: string): Promise<TableValidationResult> {
    const response = await fetch(`${API_URL}/guest/tables/validate`, {
      headers: { 'x-table-token': token }
    })
    return handleResponse(response)
  },

  async createOrder(data: {
    tableToken: string
    items: { menuItemId: string; quantity: number; modifiers?: any[]; specialInstructions?: string }[]
    notes?: string
    tipCents?: number
  }): Promise<{ order: Order }> {
    const response = await fetch(`${API_URL}/guest/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async getOrder(id: string): Promise<{ order: Order }> {
    const response = await fetch(`${API_URL}/orders/${id}`)
    return handleResponse(response)
  },

  async getPaymentIntent(id: string): Promise<{ clientSecret: string; amount: number; currency: string }> {
    const response = await fetch(`${API_URL}/orders/${id}/payment-intent`, {
      method: 'POST'
    })
    return handleResponse(response)
  },

  // Staff endpoints (require auth in production)
  async getCategories(restaurantId: string): Promise<{ categories: Category[] }> {
    const response = await fetch(`${API_URL}/restaurants/${restaurantId}/categories`)
    return handleResponse(response)
  },

  async createCategory(restaurantId: string, data: { name: string; sortOrder?: number; image?: string }): Promise<{ category: Category }> {
    const response = await fetch(`${API_URL}/restaurants/${restaurantId}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<{ category: Category }> {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async deleteCategory(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE'
    })
    return handleResponse(response)
  },

  async getMenuItems(restaurantId: string): Promise<{ menuItems: MenuItem[] }> {
    const response = await fetch(`${API_URL}/restaurants/${restaurantId}/items`)
    return handleResponse(response)
  },

  async createMenuItem(restaurantId: string, data: Partial<MenuItem>): Promise<{ menuItem: MenuItem }> {
    const response = await fetch(`${API_URL}/restaurants/${restaurantId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updateMenuItem(id: string, data: Partial<MenuItem>): Promise<{ menuItem: MenuItem }> {
    const response = await fetch(`${API_URL}/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async deleteMenuItem(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/items/${id}`, {
      method: 'DELETE'
    })
    return handleResponse(response)
  },

  async toggleItemAvailability(id: string, isAvailable: boolean): Promise<{ menuItem: MenuItem }> {
    const response = await fetch(`${API_URL}/items/${id}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable })
    })
    return handleResponse(response)
  },

  async getRestaurantOrders(restaurantId: string, status?: string): Promise<{ orders: Order[] }> {
    const url = new URL(`${API_URL}/restaurants/${restaurantId}/orders`)
    if (status) url.searchParams.set('status', status)
    const response = await fetch(url.toString())
    return handleResponse(response)
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<{ order: Order }> {
    const response = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    return handleResponse(response)
  },

  async getTables(restaurantId: string): Promise<{ tables: { id: string; number: string; seats?: number; zone?: string; qrToken: string }[] }> {
    const response = await fetch(`${API_URL}/restaurants/${restaurantId}/tables`)
    return handleResponse(response)
  },

  async createTable(restaurantId: string, data: { number: string; seats?: number; zone?: string }): Promise<{ table: any }> {
    const response = await fetch(`${API_URL}/restaurants/${restaurantId}/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async getTableQR(id: string): Promise<{ qrCode: string; qrUrl: string; tableNumber: string }> {
    const response = await fetch(`${API_URL}/tables/${id}/qr`)
    return handleResponse(response)
  }
}
