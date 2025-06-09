FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p db uploads

RUN npm run build

EXPOSE 2807

CMD ["npm", "run", "start"]