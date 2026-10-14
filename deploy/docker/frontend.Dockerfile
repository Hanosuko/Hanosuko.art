# syntax=docker/dockerfile:1.6
# Фронт собирается из исходников прямо в Docker: Vite build (с OG-картинкой и манифестом музыки),
# затем статика отдаётся через nginx.
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY deploy/docker/frontend.nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
