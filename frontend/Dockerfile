FROM alpine:3.20

WORKDIR /app

RUN apk add --no-cache nodejs npm openssl

COPY package*.json ./
RUN npm install

COPY . .

COPY cert ./cert

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]