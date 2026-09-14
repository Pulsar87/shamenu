FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage - serve built files with Caddy
FROM caddy:2-alpine

COPY --from=builder /app/dist /srv/caddy
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80
