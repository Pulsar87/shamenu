# Menu App Backend

Professional digital restaurant menu & ordering platform backend.

## Tech Stack

- **Runtime**: Node.js 22+
- **Framework**: Fastify 5
- **Database**: PostgreSQL 16 with Prisma ORM
- **Cache/Queue**: Redis 7 (Upstash compatible)
- **WebSocket**: @fastify/websocket
- **Validation**: Zod
- **Auth**: JWT (@fastify/jwt)

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 16
- Redis 7 (optional for development)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/menu_app"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3001
HOST=0.0.0.0
CORS_ORIGIN="*"
FRONTEND_URL="http://localhost:3000"
LOG_LEVEL="info"
```

### Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### Development

```bash
npm run dev
```

Server will start at `http://localhost:3001`

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Public Endpoints

- `GET /api/v1/public/restaurants/:slug` - Get restaurant by slug
- `GET /api/v1/public/restaurants/:slug/menu` - Get restaurant menu

### Guest Endpoints (Table Token)

- `GET /api/v1/guest/tables/validate` - Validate table token
- `POST /api/v1/guest/orders` - Create order from table

### Authenticated Endpoints

#### Auth
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register new user
- `GET /api/v1/auth/me` - Get current user

#### Restaurants
- `GET /api/v1/restaurants` - List restaurants
- `POST /api/v1/restaurants` - Create restaurant
- `GET /api/v1/restaurants/:id` - Get restaurant details
- `PATCH /api/v1/restaurants/:id` - Update restaurant

#### Menu
- `GET /api/v1/restaurants/:restaurantId/categories` - List categories
- `POST /api/v1/restaurants/:restaurantId/categories` - Create category
- `PATCH /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category
- `GET /api/v1/restaurants/:restaurantId/items` - List menu items
- `POST /api/v1/restaurants/:restaurantId/items` - Create menu item
- `PATCH /api/v1/items/:id` - Update menu item
- `DELETE /api/v1/items/:id` - Delete menu item
- `PATCH /api/v1/items/:id/availability` - Toggle availability

#### Orders
- `GET /api/v1/orders/:id` - Get order details
- `GET /api/v1/restaurants/:restaurantId/orders` - List restaurant orders
- `PATCH /api/v1/orders/:id/status` - Update order status
- `POST /api/v1/orders/:id/payment-intent` - Create payment intent
- `DELETE /api/v1/orders/:id` - Cancel order

#### Tables
- `GET /api/v1/restaurants/:restaurantId/tables` - List tables
- `POST /api/v1/restaurants/:restaurantId/tables` - Create table
- `GET /api/v1/tables/:id` - Get table details
- `PATCH /api/v1/tables/:id` - Update table
- `DELETE /api/v1/tables/:id` - Delete table
- `POST /api/v1/tables/:id/regenerate-qr` - Regenerate QR token
- `GET /api/v1/tables/:id/qr` - Get QR code image

### WebSocket

Connect to `/ws?channel=<channel>` where channel is:
- `kds:<restaurant_id>` - Kitchen display system
- `table:<table_token>` - Guest order tracker
- `admin:<restaurant_id>` - Admin dashboard

Events:
```json
{
  "type": "order.status_changed",
  "orderId": "uuid",
  "status": "PREPARING",
  "ts": 1234567890
}
```

## Role-Based Access Control

| Action | OWNER | MANAGER | STAFF | KITCHEN |
|--------|-------|---------|-------|---------|
| Menu CRUD | ✅ | ✅ | ❌ | ❌ |
| Order Read | ✅ | ✅ | ✅ | ✅ |
| Order Create | ✅ | ✅ | ✅ | ❌ |
| Order Status | ✅ | ✅ | ✅ | ✅ |
| Table CRUD | ✅ | ✅ | ✅ | ❌ |
| Reviews | ✅ | ✅ | ✅ | ❌ |
| Analytics | ✅ | ✅ | ❌ | ❌ |
| Settings | ✅ | ✅ | ❌ | ❌ |
| User Mgmt | ✅ | ❌ | ❌ | ❌ |

## Testing

```bash
npm test
```

## Health Checks

- `GET /health` - Basic health check
- `GET /ready` - Database connectivity check

## Architecture

```
src/
├── server.ts          # Fastify bootstrap
├── lib/
│   └── prisma.ts      # Prisma client setup
├── middleware/
│   ├── auth.ts        # JWT authentication
│   └── rbac.ts        # Role-based access control
├── routes/
│   ├── auth.ts        # Authentication routes
│   ├── restaurants.ts # Restaurant management
│   ├── menu.ts        # Menu CRUD
│   ├── orders.ts      # Order management
│   └── tables.ts      # Table & QR management
├── services/          # Business logic
├── ws/
│   └── handler.ts     # WebSocket handler
└── jobs/              # Background jobs (BullMQ)
```
