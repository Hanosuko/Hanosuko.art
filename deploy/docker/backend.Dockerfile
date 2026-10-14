# syntax=docker/dockerfile:1.6
# API: счётчик просмотров (SQLite) и прокси CISTiers
FROM node:22-alpine
WORKDIR /app

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

COPY server/*.js ./

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV DB_PATH=/data/views.sqlite

EXPOSE 3000
CMD ["node", "index.js"]
