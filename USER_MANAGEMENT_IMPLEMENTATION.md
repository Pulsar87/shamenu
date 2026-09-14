# User Management Implementation

## Overview
Implemented complete user authentication and authorization system for the Digital Menu Platform with sign-up, login, protected routes, and role-based access control.

## Changes Made

### Backend

#### 1. Database Schema (`backend/prisma/schema.prisma`)
- Added `password` field to `User` model (optional string for hashed passwords)
- Passwords are stored as bcrypt hashes

#### 2. Authentication Routes (`backend/src/routes/auth.ts`)
- **POST /api/v1/auth/register**: User registration with email, password, name, and optional role
  - Validates input with Zod schema
  - Checks for existing users
  - Hashes password with bcrypt (10 salt rounds)
  - Returns user data and JWT token
  
- **POST /api/v1/auth/login**: User authentication
  - Validates credentials
  - Compares password hash using bcrypt
  - Returns user data and JWT token (24h expiry)
  
- **GET /api/v1/auth/me**: Get current authenticated user
  - Requires valid JWT token
  - Excludes password from response

#### 3. Seed Data (`backend/prisma/seed.ts`)
- Pre-created test users with hashed passwords:
  - `owner@example.com` / `password123` (OWNER role)
  - `manager@example.com` / `password123` (MANAGER role)
  - `kitchen@example.com` / `password123` (KITCHEN role)

### Frontend

#### 1. Auth Context (`frontend/src/context/AuthContext.tsx`)
- React Context for global auth state management
- Provides:
  - `user`: Current user object or null
  - `token`: JWT token or null
  - `isLoading`: Loading state during initialization
  - `login(email, password)`: Login function
  - `register(email, password, name, restaurantId?, role?)`: Registration function
  - `logout()`: Logout function (clears localStorage)
  - `isAuthenticated`: Boolean flag
- Persists auth state in localStorage
- Auto-loads saved auth state on app mount

#### 2. API Client Updates (`frontend/src/lib/api.ts`)
- Added `setAuthToken()` function to set JWT token
- Added `getAuthHeaders()` helper for auth headers
- Added auth methods:
  - `login(email, password)`
  - `register(email, password, name, restaurantId?, role?)`
  - `getCurrentUser()`
- Staff endpoints now include auth headers

#### 3. Protected Route Component (`frontend/src/components/ProtectedRoute.tsx`)
- Wrapper component for protected routes
- Features:
  - Redirects to login if not authenticated
  - Optional role-based access control via `allowedRoles` prop
  - Shows loading spinner during auth check
  - Displays "Access Denied" page for unauthorized roles

#### 4. Login Page (`frontend/src/pages/auth/LoginPage.tsx`)
- Clean, modern login form
- Email and password inputs with validation
- Error message display
- Loading state during submission
- Link to registration page
- Link back to home page

#### 5. Register Page (`frontend/src/pages/auth/RegisterPage.tsx`)
- User registration form with:
  - Name, email, password inputs
  - Role selector (OWNER, MANAGER, STAFF, KITCHEN)
  - Form validation
  - Error handling
  - Link to login page

#### 6. App Router (`frontend/src/App.tsx`)
- Wrapped app in `AuthProvider`
- Added routes:
  - `/auth/login` - Login page
  - `/auth/register` - Registration page
  - `/staff/dashboard` - Protected staff dashboard
  - `/kds/:restaurantId` - Protected kitchen display (OWNER, MANAGER, KITCHEN only)
- Customer menu route remains public (no auth required)

#### 7. Staff Dashboard (`frontend/src/pages/staff/StaffDashboard.tsx`)
- Added user info display (name, email, role badge)
- Added logout button
- Integrated with auth context

## User Flow

### Registration
1. User visits `/auth/register`
2. Enters name, email, password, and selects role
3. Submits form → POST /api/v1/auth/register
4. Backend validates, hashes password, creates user
5. Returns JWT token and user data
6. Frontend saves to localStorage and redirects to `/staff/dashboard`

### Login
1. User visits `/auth/login`
2. Enters email and password
3. Submits form → POST /api/v1/auth/login
4. Backend validates credentials, generates JWT
5. Returns token and user data
6. Frontend saves to localStorage and redirects to `/staff/dashboard`

### Protected Route Access
1. User navigates to `/staff/dashboard`
2. `ProtectedRoute` checks auth state
3. If not authenticated → redirect to `/auth/login`
4. If authenticated but wrong role → show "Access Denied"
5. If authorized → render dashboard

### Logout
1. User clicks "Logout" button
2. Clears localStorage (token and user)
3. Resets auth context state
4. Redirects to login page

## Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: 24-hour expiration
- **Role-Based Access Control**: Enforced on frontend and backend
- **Protected Routes**: Middleware guards staff endpoints
- **Password Omission**: Never returned in API responses
- **Input Validation**: Zod schemas on all auth endpoints

## Test Credentials

After running `npm run db:seed`:
- Owner: `owner@example.com` / `password123`
- Manager: `manager@example.com` / `password123`
- Kitchen: `kitchen@example.com` / `password123`

## Next Steps (Per build.md)

To fully comply with build.md specifications:

1. **Next.js Migration**: Convert from Vite/React Router to Next.js 15 App Router
2. **NextAuth v5 Integration**: Replace custom JWT with NextAuth
3. **Google OAuth**: Add Google provider to NextAuth
4. **Table Guest Tokens**: Implement short-lived tokens for table access
5. **Session Store**: Use Redis for session management
6. **CSRF Protection**: Add CSRF tokens for cookie-based auth

## Files Created/Modified

### Created:
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/pages/auth/LoginPage.tsx`
- `frontend/src/pages/auth/RegisterPage.tsx`
- `frontend/src/components/ProtectedRoute.tsx`

### Modified:
- `frontend/src/App.tsx`
- `frontend/src/lib/api.ts`
- `frontend/src/pages/staff/StaffDashboard.tsx`
- `backend/src/routes/auth.ts`
- `backend/prisma/schema.prisma`
- `backend/prisma/seed.ts`
