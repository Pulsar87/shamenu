import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { useRestaurantOrders } from '../../hooks/useMenu'
import { KDSBoard } from '../../components/KDSBoard'

interface StaffDashboardProps {
  restaurantId: string
}

export function StaffDashboard({ restaurantId }: StaffDashboardProps) {
  const [activeTab, setActiveTab] = useState<'kds' | 'menu' | 'tables'>('kds')
  const { orders, updateOrderStatus } = useRestaurantOrders(restaurantId)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Staff Dashboard</h1>
          <nav className="flex gap-2">
            <button
              onClick={() => setActiveTab('kds')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'kds'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary'
              }`}
            >
              KDS Board
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'menu'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary'
              }`}
            >
              Menu
            </button>
            <button
              onClick={() => setActiveTab('tables')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'tables'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary'
              }`}
            >
              Tables
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main>
        {activeTab === 'kds' && (
          <KDSBoard
            restaurantId={restaurantId}
            orders={orders}
            onUpdateStatus={updateOrderStatus}
          />
        )}

        {activeTab === 'menu' && (
          <MenuManager restaurantId={restaurantId} />
        )}

        {activeTab === 'tables' && (
          <TableManager restaurantId={restaurantId} />
        )}
      </main>
    </div>
  )
}

function MenuManager({ restaurantId }: { restaurantId: string }) {
  const [categories, setCategories] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getCategories(restaurantId),
      api.getMenuItems(restaurantId)
    ]).then(([catsRes, itemsRes]) => {
      setCategories(catsRes.categories)
      setItems(itemsRes.menuItems)
      setLoading(false)
    }).catch(err => {
      console.error('Failed to load menu:', err)
      setLoading(false)
    })
  }, [restaurantId])

  const toggleAvailability = async (itemId: string, current: boolean) => {
    const { menuItem } = await api.toggleItemAvailability(itemId, !current)
    setItems(prev => prev.map(i => i.id === itemId ? menuItem : i))
  }

  if (loading) {
    return <div className="p-6 text-muted-foreground">Loading menu...</div>
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Menu Manager</h2>

      <div className="space-y-6">
        {categories.map(category => (
          <div key={category.id}>
            <h3 className="text-lg font-semibold mb-3">{category.name}</h3>
            <div className="space-y-2">
              {items.filter(i => i.categoryId === category.id).map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${(item.priceCents / 100).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleAvailability(item.id, item.isAvailable)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      item.isAvailable
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {item.isAvailable ? 'Available' : 'Sold Out'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TableManager({ restaurantId }: { restaurantId: string }) {
  const [tables, setTables] = useState<any[]>([])
  const [qrCodes, setQRCodes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getTables(restaurantId).then(({ tables }) => {
      setTables(tables)
      setLoading(false)
    }).catch(err => {
      console.error('Failed to load tables:', err)
      setLoading(false)
    })
  }, [restaurantId])

  const loadQRCode = async (tableId: string) => {
    if (qrCodes[tableId]) return

    try {
      const { qrCode } = await api.getTableQR(tableId)
      setQRCodes(prev => ({ ...prev, [tableId]: qrCode }))
    } catch (err) {
      console.error('Failed to load QR code:', err)
    }
  }

  if (loading) {
    return <div className="p-6 text-muted-foreground">Loading tables...</div>
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Table & QR Manager</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map(table => (
          <div key={table.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="font-semibold">Table {table.number}</p>
                {table.zone && (
                  <p className="text-sm text-muted-foreground">Zone: {table.zone}</p>
                )}
              </div>
              <button
                onClick={() => loadQRCode(table.id)}
                className="text-sm text-primary hover:underline"
              >
                Show QR
              </button>
            </div>

            {qrCodes[table.id] && (
              <div className="mt-2">
                <img src={qrCodes[table.id]} alt="QR Code" className="w-32 h-32 mx-auto" />
                <p className="text-xs text-center text-muted-foreground mt-1">
                  Scan to view menu
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
