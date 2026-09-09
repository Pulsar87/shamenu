import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { CustomerMenuPage } from './pages/customer/CustomerMenuPage'
import { StaffDashboard } from './pages/staff/StaffDashboard'
import { ChefView } from './pages/staff/ChefView'
import { QrCode, Utensils, Smartphone, Clock, CheckCircle, ArrowRight } from 'lucide-react'

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="h-6 w-6 text-orange-600" />
            <span className="text-xl font-bold text-gray-900">Digital Menu</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-600 hover:text-orange-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-orange-600 transition-colors">How It Works</a>
            <a href="#demo" className="text-gray-600 hover:text-orange-600 transition-colors">Demo</a>
          </nav>
          <Link 
            to="/staff/1" 
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            Staff Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <CheckCircle className="h-4 w-4" />
            Modern Restaurant Ordering Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your Restaurant with
            <span className="text-orange-600"> Digital Ordering</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Contactless QR code menus, real-time kitchen display systems, and seamless order tracking. 
            Everything your restaurant needs to modernize the dining experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/m/demo-restaurant/t/demo-token" 
              className="bg-orange-600 text-white px-8 py-4 rounded-xl hover:bg-orange-700 transition-colors font-semibold text-lg inline-flex items-center justify-center gap-2"
            >
              Try Demo Menu
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a 
              href="#how-it-works" 
              className="bg-white text-gray-700 border-2 border-gray-200 px-8 py-4 rounded-xl hover:border-orange-600 hover:text-orange-600 transition-colors font-semibold text-lg inline-flex items-center justify-center"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A complete platform designed for modern restaurants
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<QrCode className="h-8 w-8 text-orange-600" />}
              title="QR Code Menus"
              description="Customers scan to view menus on their phones. No downloads required."
            />
            <FeatureCard
              icon={<Smartphone className="h-8 w-8 text-orange-600" />}
              title="Mobile Ordering"
              description="Seamless ordering experience optimized for all mobile devices."
            />
            <FeatureCard
              icon={<Utensils className="h-8 w-8 text-orange-600" />}
              title="Kitchen Display"
              description="Real-time order updates for kitchen staff with priority management."
            />
            <FeatureCard
              icon={<Clock className="h-8 w-8 text-orange-600" />}
              title="Order Tracking"
              description="Customers track their order status from preparation to delivery."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple setup, powerful results
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <StepCard
              number="1"
              title="Scan QR Code"
              description="Customer scans the table QR code to access the digital menu"
            />
            <StepCard
              number="2"
              title="Browse & Order"
              description="Customer browses menu, adds items to cart, and places order"
            />
            <StepCard
              number="3"
              title="Kitchen Receives"
              description="Order appears instantly on kitchen display for preparation"
            />
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to See It in Action?</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Experience the full customer journey with our interactive demo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/m/demo-restaurant/t/demo-token" 
              className="bg-orange-600 text-white px-8 py-4 rounded-xl hover:bg-orange-700 transition-colors font-semibold text-lg inline-flex items-center justify-center gap-2"
            >
              View Customer Menu
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              to="/staff/1" 
              className="bg-gray-900 text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-colors font-semibold text-lg inline-flex items-center justify-center gap-2"
            >
              View Staff Dashboard
              <Utensils className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Utensils className="h-6 w-6 text-orange-500" />
              <span className="text-xl font-bold">Digital Menu</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 Digital Menu Platform. Built for modern restaurants.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page - Default route */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Customer-facing menu page */}
        <Route path="/m/:slug/t/:token" element={<CustomerMenuPage />} />
        
        {/* Staff dashboard - in production this would be protected by auth */}
        <Route path="/staff/:restaurantId" element={<StaffDashboard restaurantId={""} />} />
        
        {/* Kitchen Display System */}
        <Route path="/kds/:restaurantId" element={<ChefView restaurantId={""} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
