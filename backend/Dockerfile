FROM node:16-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .


FROM node: 16-alpine

WORKDIR /app

RUN nppm i -g pm2

COPY --from=builder /app/package.json /app/package-lock.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/src ./src
COPY --from=builder /app/ecosystem.config.js ./

EXPOSE 4000

CMD [ "pm2-runtime", "ecosystem.config.js" ]