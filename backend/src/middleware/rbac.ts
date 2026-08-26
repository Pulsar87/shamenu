import { FastifyInstance } from 'fastify'
import { UserRole } from '@prisma/client'

interface RBACConfig {
  [key: string]: {
    OWNER?: boolean
    MANAGER?: boolean
    STAFF?: boolean
    KITCHEN?: boolean
  }
}

/**
 * Role-Based Access Control matrix
 * Defines which roles can access which resources/actions
 */
const rbacMatrix: RBACConfig = {
  // Menu management
  'menu:create': { OWNER: true, MANAGER: true },
  'menu:read': { OWNER: true, MANAGER: true, STAFF: true, KITCHEN: true },
  'menu:update': { OWNER: true, MANAGER: true },
  'menu:delete': { OWNER: true, MANAGER: true },
  
  // Order management
  'order:create': { OWNER: true, MANAGER: true, STAFF: true },
  'order:read': { OWNER: true, MANAGER: true, STAFF: true, KITCHEN: true },
  'order:update': { OWNER: true, MANAGER: true, STAFF: true, KITCHEN: true },
  'order:cancel': { OWNER: true, MANAGER: true },
  
  // KDS operations
  'kds:read': { OWNER: true, MANAGER: true, KITCHEN: true },
  'kds:update_status': { OWNER: true, MANAGER: true, KITCHEN: true },
  
  // Table management
  'table:create': { OWNER: true, MANAGER: true },
  'table:read': { OWNER: true, MANAGER: true, STAFF: true },
  'table:update': { OWNER: true, MANAGER: true },
  'table:delete': { OWNER: true, MANAGER: true },
  
  // Reviews
  'review:read': { OWNER: true, MANAGER: true, STAFF: true },
  'review:respond': { OWNER: true, MANAGER: true },
  'review:delete': { OWNER: true, MANAGER: true },
  
  // Analytics
  'analytics:read': { OWNER: true, MANAGER: true },
  
  // Settings
  'settings:read': { OWNER: true, MANAGER: true },
  'settings:update': { OWNER: true },
  'settings:billing': { OWNER: true },
  
  // User management
  'user:create': { OWNER: true },
  'user:read': { OWNER: true, MANAGER: true },
  'user:update': { OWNER: true },
  'user:delete': { OWNER: true }
}

/**
 * Check if a role has permission for an action
 */
export function hasPermission(role: UserRole, action: string): boolean {
  const permissions = rbacMatrix[action]
  if (!permissions) return false
  
  return permissions[role as keyof typeof permissions] || false
}

/**
 * Middleware to check RBAC permissions
 */
export async function rbacMiddleware(fastify: FastifyInstance) {
  // Add permission check decorator
  fastify.decorateRequest('checkPermission', function(action: string) {
    if (!this.user) {
      throw new Error('User not authenticated')
    }
    
    const allowed = hasPermission(this.user.role as UserRole, action)
    if (!allowed) {
      throw new Error(`Permission denied: ${action}`)
    }
  })
}

declare module 'fastify' {
  interface FastifyRequest {
    checkPermission(action: string): void
  }
}
