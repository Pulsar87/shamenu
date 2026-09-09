import { useState } from 'react'
import type { MenuItem, CartItem } from '../lib/api'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const addItem = (menuItem: MenuItem, quantity: number, modifiers?: any[], specialInstructions?: string) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.menuItem.id === menuItem.id &&
                JSON.stringify(item.modifiers) === JSON.stringify(modifiers)
      )

      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          lineTotalCents: (updated[existingIndex].quantity + quantity) *
            (menuItem.priceCents + (modifiers?.reduce((sum, m) => sum + (m.extraPriceCents || 0), 0) || 0))
        }
        return updated
      }

      const modifierTotal = modifiers?.reduce((sum, m) => sum + (m.extraPriceCents || 0), 0) || 0
      const lineTotalCents = (menuItem.priceCents + modifierTotal) * quantity

      return [...prev, {
        menuItem,
        quantity,
        modifiers,
        specialInstructions,
        lineTotalCents
      }]
    })
    setIsOpen(true)
  }

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index)
      return
    }

    setItems(prev => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        quantity,
        lineTotalCents: quantity * (updated[index].menuItem.priceCents +
          (updated[index].modifiers?.reduce((sum, m) => sum + (m.extraPriceCents || 0), 0) || 0))
      }
      return updated
    })
  }

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const clearCart = () => {
    setItems([])
  }

  const subtotalCents = items.reduce((sum, item) => sum + item.lineTotalCents, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return {
    items,
    isOpen,
    setIsOpen,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    subtotalCents,
    itemCount
  }
}
