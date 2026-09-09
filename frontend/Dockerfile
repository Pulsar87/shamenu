FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Copy built files to a volume directory that caddy can serve
FROM alpine:latest
RUN mkdir -p /srv/caddy
COPY --from=builder /app/dist/* /srv/caddy/

VOLUME /srv/caddy
