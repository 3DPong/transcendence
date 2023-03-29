FROM node:18.15-alpine

WORKDIR /app

COPY . .

# install packages
RUN npm install
# build
RUN nest build

EXPOSE 3000
# production mode
ENV NODE_ENV prod

ENTRYPOINT [ "node", "./dist/main.js" ]