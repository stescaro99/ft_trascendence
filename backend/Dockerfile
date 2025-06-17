FROM alpine:3.20

WORKDIR /app

RUN apk add --no-cache nodejs npm openssl

COPY package*.json ./
RUN npm install

COPY . .

# Genera i certificati in /app/cert
RUN mkdir -p cert && \
    openssl req -x509 -newkey rsa:4096 -sha256 -days 365 \
    -nodes -keyout cert/key.pem -out cert/cert.pem \
    -subj "/CN=localhost"

RUN mkdir -p db uploads

# Costruisci il progetto
RUN npm run build

# Copia la cartella cert dentro dist/
RUN cp -r cert dist/

EXPOSE 2807

CMD ["npm", "run", "start"]