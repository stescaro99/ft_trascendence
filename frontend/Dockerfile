FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Genera i certificati in /app/cert
RUN mkdir -p cert && \
    apk add --no-cache openssl && \
    openssl req -x509 -newkey rsa:4096 -sha256 -days 365 \
    -nodes -keyout cert/key.pem -out cert/cert.pem \
    -subj "/CN=localhost"

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]