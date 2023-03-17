FROM node:18.15-alpine

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

ENTRYPOINT [ "node", "./dist/main.js" ]