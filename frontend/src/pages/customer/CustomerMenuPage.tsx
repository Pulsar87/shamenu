import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import type { MenuItem, Order } from '../../lib/api'
import { api } from '../../lib/api'
import { useMenu as useMenuHook } from '../../hooks/useMenu'
import { useCart } from '../../hooks/useCart'
import { useWebSocket } from '../../hooks/useWebSocket'
import { ItemModal } from '../../components/ItemModal'
import { CartSheet } from '../../components/CartSheet'
import { OrderTracker } from '../../components/OrderTracker'

export function CustomerMenuPage() {
  const { slug, token } = useParams<{ slug: string; token: string }>()
  const [tableInfo, setTableInfo] = useState<any>(null)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('')

  const { categories, loading, error } = useMenuHook(slug!)
  const cart = useCart()

  // Validate table token
  useEffect(() => {
    if (token && slug) {
      api.validateTable(token).then(({ table, restaurant }) => {
        setTableInfo({ table, restaurant })
      }).catch((err: any) => {
        console.error('Invalid table token:', err)
      })
    }
  }, [token, slug])

  // WebSocket for order updates
  const handleWSMessage = (event: any) => {
    if (event.type === 'order.status_changed' && currentOrder && event.orderId === currentOrder.id) {
      setCurrentOrder((prev: any) => prev ? { ...prev, status: event.status } : null)
    }
  }

  const { isConnected } = useWebSocket({
    channel: token ? `table:${token}` : '',
    onMessage: handleWSMessage,
    reconnectAttempts: 5
  })

  const handleAddToCart = (quantity: number, modifiers?: any[], specialInstructions?: string) => {
    if (selectedItem) {
      cart.addItem(selectedItem, quantity, modifiers, specialInstructions)
    }
  }

  const handleCheckout = async () => {
    if (!token || cart.items.length === 0) return

    try {
      const items = cart.items.map((item: any) => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        modifiers: item.modifiers,
        specialInstructions: item.specialInstructions
      }))

      const { order } = await api.createOrder({
        tableToken: token,
        items,
        tipCents: 0
      })

      setCurrentOrder(order)
      cart.clearCart()
    } catch (err: any) {
      alert('Failed to create order: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading menu...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-destructive">{error}</div>
      </div>
    )
  }

  if (currentOrder) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b p-4">
          <h1 className="text-xl font-bold">{tableInfo?.restaurant.name}</h1>
          <p className="text-sm text-muted-foreground">Table {tableInfo?.table.number}</p>
        </header>
        <OrderTracker order={currentOrder} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
        <div className="p-4">
          <h1 className="text-xl font-bold">{tableInfo?.restaurant.name}</h1>
          <p className="text-sm text-muted-foreground">Table {tableInfo?.table.number}</p>
          {isConnected && (
            <div className="flex items-center gap-1 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">Live updates</span>
            </div>
          )}
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id)
                document.getElementById(`category-${category.id}`)?.scrollIntoView({ behavior: 'smooth' })
              }}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                activeCategory === category.id || !activeCategory
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </header>

      {/* Menu sections */}
      <main>
        {categories.map(category => (
          <section
            key={category.id}
            id={`category-${category.id}`}
            className="p-4"
          >
            <h2 className="text-lg font-semibold mb-3">{category.name}</h2>
            <div className="space-y-4">
              {(category.menuItems || []).map(item => (
                <div
                  key={item.id}
                  onClick={() => item.isAvailable && setSelectedItem(item)}
                  className={`flex gap-4 p-3 rounded-lg border cursor-pointer transition-opacity ${
                    !item.isAvailable ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary/50'
                  }`}
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{item.name}</h3>
                      <span className="font-semibold">${(item.priceCents / 100).toFixed(2)}</span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    )}
                    {item.allergens?.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {item.allergens.slice(0, 3).map(allergen => (
                          <span
                            key={allergen}
                            className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded"
                          >
                            {allergen}
                          </span>
                        ))}
                      </div>
                    )}
                    {!item.isAvailable && (
                      <span className="text-xs text-destructive font-medium">Sold Out</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Floating cart bar */}
      {cart.itemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40">
          <button
            onClick={() => cart.setIsOpen(true)}
            className="w-full bg-primary text-primary-foreground p-4 rounded-lg shadow-lg flex justify-between items-center hover:bg-primary/90 transition-colors"
          >
            <span className="font-medium">{cart.itemCount} items</span>
            <span className="font-semibold">${(cart.subtotalCents / 100).toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Modals */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      <CartSheet
        items={cart.items}
        isOpen={cart.isOpen}
        onClose={() => cart.setIsOpen(false)}
        onUpdateQuantity={cart.updateQuantity}
        onRemoveItem={cart.removeItem}
        subtotalCents={cart.subtotalCents}
        onCheckout={handleCheckout}
      />
    </div>
  )
}
