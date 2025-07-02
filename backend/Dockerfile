FROM alpine:3.20

WORKDIR /app

RUN apk add --no-cache nodejs npm

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p db uploads

# Costruisci il progetto
RUN npm run build

EXPOSE 9443

CMD ["npm", "run", "start"]