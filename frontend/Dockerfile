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

# Installa solo quello che serve per servire i file statici
RUN apk add --no-cache nginx

# Crea le directory necessarie
RUN mkdir -p /usr/share/nginx/html

# Copia i file build dal stage precedente
COPY --from=builder /app/dist /usr/share/nginx/html

# Espone la porta (anche se non sarà usata direttamente)
EXPOSE 80

# Questo container serve solo per fornire i file al volume
CMD ["cp", "-r", "/usr/share/nginx/html/.", "/tmp/"]