FROM node:22-alpine

WORKDIR /app

# Install dependencies (including devDependencies for Prisma and tsx)
COPY package*.json ./
RUN npm ci --include=dev

# Copy prisma schema and generate client
COPY prisma ./prisma
COPY prisma.config.ts ./
# Pass DATABASE_URL for Prisma generation and migrations at build time
ARG DATABASE_URL=postgresql://menu_app:menu_app_password@postgres:5432/menu_app
ENV DATABASE_URL=${DATABASE_URL}

RUN npx prisma generate

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Copy entrypoint script
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Use entrypoint script
ENTRYPOINT ["./entrypoint.sh"]
