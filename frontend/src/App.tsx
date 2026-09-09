import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CustomerMenuPage } from './pages/customer/CustomerMenuPage'
import { StaffDashboard } from './pages/staff/StaffDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer-facing menu page */}
        <Route path="/m/:slug/t/:token" element={<CustomerMenuPage />} />
        
        {/* Staff dashboard - in production this would be protected by auth */}
        <Route path="/staff/:restaurantId" element={<StaffDashboard restaurantId={""} />} />
        
        {/* Default route */}
        <Route path="/" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Digital Menu App</h1>
              <p className="text-muted-foreground mb-6">
                Professional restaurant ordering platform
              </p>
              <div className="space-y-2">
                <p className="text-sm">
                  Customer: <code className="bg-muted px-2 py-1 rounded">/m/{'{slug}'}/t/{'{token}'}</code>
                </p>
                <p className="text-sm">
                  Staff: <code className="bg-muted px-2 py-1 rounded">/staff/{'{restaurantId}'}</code>
                </p>
              </div>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
