FROM node:18.15-alpine

WORKDIR /app

COPY . .

# install packages
RUN npm install
RUN npm install -g @nestjs/cli
# build
RUN nest build

EXPOSE 5000
# production mode
ENV NODE_ENV prod

ENTRYPOINT [ "node", "./dist/main.js" ]