import type { CartItem } from '../lib/api'

interface CartSheetProps {
  items: CartItem[]
  isOpen: boolean
  onClose: () => void
  onUpdateQuantity: (index: number, quantity: number) => void
  onRemoveItem: (index: number) => void
  subtotalCents: number
  onCheckout: () => void
}

export function CartSheet({
  items,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  subtotalCents,
  onCheckout
}: CartSheetProps) {
  if (!isOpen) return null

  const taxRate = 0.08
  const taxCents = Math.round(subtotalCents * taxRate)
  const totalCents = subtotalCents + taxCents

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-lg shadow-lg max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Order</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.menuItem.name}</h3>
                      {item.modifiers && item.modifiers.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {item.modifiers.map(m => m.name).join(', ')}
                        </p>
                      )}
                      {item.specialInstructions && (
                        <p className="text-sm text-muted-foreground italic">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-secondary"
                        >
                          −
                        </button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-secondary"
                        >
                          +
                        </button>
                        <button
                          onClick={() => onRemoveItem(index)}
                          className="ml-auto text-destructive text-sm hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(item.lineTotalCents / 100).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${(subtotalCents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax (8%)</span>
                  <span>${(taxCents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>${(totalCents / 100).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={onCheckout}
                disabled={items.length === 0}
                className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium mt-4 hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Send to Kitchen
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
