FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Output stage - just copy the dist folder
FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/dist ./dist

CMD ["echo", "Frontend built successfully"]
