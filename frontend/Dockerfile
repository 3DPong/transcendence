FROM node:18.15-alpine

WORKDIR /app

COPY . .

# install packages
RUN npm install
RUN npm install -g serve
#RUN npm install webpack-serve
#RUN apk add xsel

# build
RUN npm run build

EXPOSE 8081
# production mode
ENV NODE_ENV prod

ENTRYPOINT [ "serve", "./dist", "-p", "8081"  ]
#ENTRYPOINT [ "webpack-serve", "--static", "./dist", "--port", "8081"  ]

