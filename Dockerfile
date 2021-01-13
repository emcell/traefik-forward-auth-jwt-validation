FROM node:14 as builder

WORKDIR /app
COPY ./package.json ./
COPY ./yarn.lock ./

RUN yarn install
COPY . .
RUN yarn build

FROM node:14-alpine
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 80:3000
CMD ["npm", "run", "start:prod"]
