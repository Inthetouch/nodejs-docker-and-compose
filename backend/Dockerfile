FROM node:16-alpine AS builder
WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .
RUN npm run build


FROM node:16-alpine
WORKDIR /app

RUN npm i -g pm2

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY ecosystem.config.js ./

EXPOSE 4000
CMD [ "pm2-runtime", "ecosystem.config.js" ]