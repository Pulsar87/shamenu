import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Digital Menu App</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Welcome to Digital Menu</h2>
          <p className="text-muted-foreground mb-6">
            Your professional restaurant ordering platform
          </p>
          
          <div className="bg-card rounded-lg shadow p-6 max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-4">Get Started</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Edit <code className="bg-muted px-2 py-1 rounded">src/App.tsx</code> and save to test HMR
            </p>
            <button
              type="button"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              onClick={() => setCount((count) => count + 1)}
            >
              Count is {count}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
