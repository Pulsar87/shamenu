import { useState } from 'react'
import type { MenuItem } from '../lib/api'

interface ItemModalProps {
  item: MenuItem
  isOpen: boolean
  onClose: () => void
  onAddToCart: (quantity: number, modifiers?: any[], specialInstructions?: string) => void
}

export function ItemModal({ item, isOpen, onClose, onAddToCart }: ItemModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [selectedModifiers, setSelectedModifiers] = useState<any[]>([])

  if (!isOpen) return null

  const handleAddToCart = () => {
    onAddToCart(quantity, selectedModifiers, specialInstructions || undefined)
    onClose()
    setQuantity(1)
    setSpecialInstructions('')
    setSelectedModifiers([])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-background w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-lg sm:rounded-lg shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-48 object-cover"
          />
        )}

        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-bold">{item.name}</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          {item.description && (
            <p className="text-muted-foreground mb-4">{item.description}</p>
          )}

          <div className="text-lg font-semibold mb-4">
            ${(item.priceCents / 100).toFixed(2)}
          </div>

          {item.allergens?.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Allergens</h3>
              <div className="flex flex-wrap gap-2">
                {item.allergens.map(allergen => (
                  <span
                    key={allergen}
                    className="px-2 py-1 bg-secondary text-secondary-foreground text-sm rounded"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.prepTimeMin && (
            <p className="text-sm text-muted-foreground mb-4">
              Prep time: {item.prepTimeMin} min
            </p>
          )}

          <div className="mb-4">
            <label className="block font-medium mb-2">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-secondary"
              >
                −
              </button>
              <span className="text-xl font-medium w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-secondary"
              >
                +
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-2">Special Instructions</label>
            <textarea
              value={specialInstructions}
              onChange={e => setSpecialInstructions(e.target.value)}
              placeholder="E.g., no onions, extra sauce..."
              className="w-full p-3 border rounded-md resize-none"
              rows={3}
            />
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Add to Order — ${(item.priceCents * quantity / 100).toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  )
}
