#!/bin/sh
set -e

# Generate Prisma Client (uses DATABASE_URL from ENV)
npm run db:generate

# Wait for database to be ready
echo "Waiting for database to be ready..."
while ! nc -z postgres 5432; do
  echo "Database is not yet available - sleeping"
  sleep 2
done

echo "Database is up - running migrations"

# Run migrations
npm run db:migrate

# Start the application
echo "Starting application..."
exec node dist/server.js
