# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY src ./src
COPY drizzle.config.ts ./
# Copy migrations directory if it exists
COPY drizzle ./drizzle

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

# Install postgresql-client for pg_isready
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for migrations with tsx)
RUN npm ci

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/drizzle.config.ts ./
# Copy drizzle migrations from builder
COPY --from=builder /app/drizzle ./drizzle

# Expose port
EXPOSE 4501

# Start the server (migrations run in docker-compose command)
CMD ["node", "dist/server.js"]

