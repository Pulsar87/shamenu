import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../lib/api'

export interface User {
  id: string
  email: string
  name: string | null
  role: 'OWNER' | 'MANAGER' | 'STAFF' | 'KITCHEN'
  restaurantId: string | null
  avatar: string | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, restaurantId?: string, role?: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      api.setAuthToken(storedToken)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password)
      const { user, token } = response
      
      setUser(user)
      setToken(token)
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(user))
      api.setAuthToken(token)
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Login failed')
    }
  }

  const register = async (email: string, password: string, name: string, restaurantId?: string, role?: string) => {
    try {
      const response = await api.register(email, password, name, restaurantId, role)
      const { user, token } = response
      
      setUser(user)
      setToken(token)
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(user))
      api.setAuthToken(token)
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Registration failed')
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    api.setAuthToken(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useRequireAuth(allowedRoles?: string[]) {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return { loading: true, authorized: false }
  }

  if (!isAuthenticated) {
    return { loading: false, authorized: false }
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return { loading: false, authorized: false, forbidden: true }
  }

  return { loading: false, authorized: true, user }
}
