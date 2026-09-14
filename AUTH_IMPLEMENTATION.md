# User Authentication & Authorization Implementation

## Overview
This document describes the complete user authentication and authorization system implemented for the Digital Menu Platform. The system provides secure login, registration, role-based access control (RBAC), and protected routes for staff areas while keeping customer-facing features public.

## Architecture

### Backend Components

#### 1. Database Schema (`prisma/schema.prisma`)
- **User Model**: Extended with `password` field for bcrypt-hashed passwords
- **UserRole Enum**: Defines four roles - `OWNER`, `MANAGER`, `STAFF`, `KITCHEN`
- **Relationships**: Users linked to restaurants via `restaurantId`

#### 2. Authentication Routes (`src/routes/auth.ts`)
Three endpoints handle all authentication flows:

**POST /api/v1/auth/register**
- Validates email, password (min 6 chars), name, optional role
- Checks for existing users
- Hashes password with bcrypt (10 salt rounds)
- Creates user and returns JWT token (24h expiry)
- Response: `{ user, token }`

**POST /api/v1/auth/login**
- Validates email and password
- Verifies credentials against database
- Generates JWT token with user claims (userId, email, role, restaurantId)
- Response: `{ user, token }`

**GET /api/v1/auth/me**
- Protected route requiring valid JWT
- Returns current user details (excludes password)
- Used for session restoration

#### 3. Authentication Middleware (`src/middleware/auth.ts`)
- JWT verification using Fastify JWT plugin
- Attaches decoded user to `request.user`
- Handles token expiration and invalid tokens

#### 4. RBAC Middleware (`src/middleware/rbac.ts`)
- Role-based access control
- Checks `request.user.role` against allowed roles
- Returns 403 Forbidden for unauthorized roles

### Frontend Components

#### 1. API Client (`src/lib/api.ts`)
- Centralized API communication
- `setAuthToken()`: Stores JWT in memory for authenticated requests
- `getAuthHeaders()`: Adds Bearer token to request headers
- Auth methods: `login()`, `register()`, `getCurrentUser()`

#### 2. Auth Context (`src/context/AuthContext.tsx`)
React context providing global auth state:
- **State**: `user`, `token`, `isLoading`, `isAuthenticated`
- **Methods**: `login()`, `register()`, `logout()`
- **Persistence**: Stores token and user in localStorage
- **Auto-restoration**: Loads auth state on app mount

#### 3. Protected Route Component (`src/components/ProtectedRoute.tsx`)
Higher-order component for route protection:
- Checks authentication status
- Validates user role against `allowedRoles` prop
- Redirects unauthenticated users to `/auth/login`
- Shows "Access Denied" for unauthorized roles

#### 4. Login Page (`src/pages/auth/LoginPage.tsx`)
- Email/password form with validation
- Error handling and loading states
- Link to registration page
- Redirects to dashboard on success

#### 5. Register Page (`src/pages/auth/RegisterPage.tsx`)
- Registration form with name, email, password, role selection
- Role dropdown: Staff, Manager, Owner, Kitchen Staff
- Error handling and loading states
- Link to login page
- Auto-login after successful registration

#### 6. App Router (`src/App.tsx`)
- Integrated auth pages into routing
- Protected routes for staff dashboard and KDS
- Landing page remains public
- Customer menu remains public (no auth required)

## Security Features

### Password Security
- **Hashing**: bcrypt with 10 salt rounds
- **Storage**: Only hashed passwords stored in database
- **Validation**: Minimum 6 characters enforced

### Token Security
- **Algorithm**: JWT with HS256
- **Expiry**: 24 hours
- **Claims**: userId, email, role, restaurantId
- **Storage**: localStorage (client-side)

### Access Control
- **Frontend**: Route-level protection with role checks
- **Backend**: Middleware validates JWT and roles
- **Defense in Depth**: Both layers enforce authorization

## User Roles

| Role | Permissions |
|------|-------------|
| OWNER | Full access to all restaurant features |
| MANAGER | Manage menu, orders, tables, staff |
| STAFF | View orders, update order status |
| KITCHEN | Access to kitchen display system only |

## Test Credentials

After running `npm run db:seed`, use these accounts:

```
Owner Account:
Email: owner@example.com
Password: password123
Role: OWNER

Manager Account:
Email: manager@example.com
Password: password123
Role: MANAGER

Kitchen Staff:
Email: kitchen@example.com
Password: password123
Role: KITCHEN
```

## Usage Flow

### Registration
1. User navigates to `/auth/register`
2. Fills out form (name, email, password, role)
3. Submits → POST `/api/v1/auth/register`
4. Backend creates user, returns JWT
5. Frontend stores token + user in localStorage
6. Redirects to `/staff/dashboard`

### Login
1. User navigates to `/auth/login`
2. Enters email and password
3. Submits → POST `/api/v1/auth/login`
4. Backend verifies credentials, returns JWT
5. Frontend stores token + user in localStorage
6. Redirects to `/staff/dashboard`

### Session Restoration
1. App loads → AuthContext checks localStorage
2. If token exists, sets auth state
3. Protected routes check `isAuthenticated`
4. User can access protected areas immediately

### Logout
1. User clicks logout button
2. Clears localStorage (token + user)
3. Resets auth context state
4. Redirects to login or landing page

## File Changes Summary

### Modified Files
- `prisma/schema.prisma` - Added password field to User model
- `frontend/src/lib/api.ts` - Added setAuthToken, getAuthHeaders, login/register methods
- `frontend/src/App.tsx` - Added auth routes and protected routes

### New Files
- `backend/src/routes/auth.ts` - Authentication endpoints
- `backend/src/middleware/auth.ts` - JWT verification middleware
- `backend/src/middleware/rbac.ts` - Role-based access control
- `frontend/src/context/AuthContext.tsx` - Global auth state management
- `frontend/src/components/ProtectedRoute.tsx` - Route protection component
- `frontend/src/pages/auth/LoginPage.tsx` - Login UI
- `frontend/src/pages/auth/RegisterPage.tsx` - Registration UI

## Build Verification

Both frontend and backend build successfully:
```bash
cd frontend && npm run build  # ✓ Success
cd backend && npm run build  # ✓ Success
```

## Next Steps (Optional Enhancements)

1. **Password Reset**: Email-based password recovery
2. **OAuth Integration**: Google/Facebook login
3. **2FA**: Two-factor authentication for sensitive operations
4. **Session Management**: Refresh tokens, device tracking
5. **Account Verification**: Email confirmation on registration
6. **Rate Limiting**: Prevent brute force attacks on login

## Support

For issues or questions about the authentication system, refer to:
- Backend logs for API errors
- Browser console for frontend auth state issues
- Database for user records and roles
