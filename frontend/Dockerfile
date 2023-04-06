
# Production용 dockerfile입니다.

FROM node:18.15-alpine
WORKDIR /app
COPY . .
# install packages
RUN npm install
# Serve in 8081
RUN npm install -g serve
# build
RUN npm run build

EXPOSE 8081
# production mode
ENV NODE_ENV prod

# set-tup entrypoint
ENTRYPOINT [ "serve", "./dist", "-p", "8081"  ]

