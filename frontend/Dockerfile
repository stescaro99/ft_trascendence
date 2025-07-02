# Build stage
FROM alpine:3.20 as builder

WORKDIR /app

RUN apk add --no-cache nodejs npm

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM alpine:3.20

WORKDIR /app

# Installa Node.js per servire l'app con HTTPS
RUN apk add --no-cache nodejs npm

# Copia i file build dal stage precedente
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./

# Installa solo le dipendenze di produzione necessarie per HTTPS server
RUN npm install --only=production express helmet

EXPOSE 8443

CMD ["node", "server.js"]
