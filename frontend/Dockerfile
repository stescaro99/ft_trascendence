# Build stage
FROM alpine:3.20 as builder

WORKDIR /app

RUN apk add --no-cache nodejs npm

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Build TypeScript server (emits to dist-server)
RUN npm run build:server

# Production stage
FROM alpine:3.20

WORKDIR /app

# Installa Node.js per servire l'app con HTTPS
RUN apk add --no-cache nodejs npm

COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built frontend and compiled server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

EXPOSE 8443

CMD ["node", "dist-server/server.js"]
