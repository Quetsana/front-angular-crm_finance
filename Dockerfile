# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime - Nginx
FROM nginx:alpine

COPY --from=builder /app/dist/front-angular-crm_finances/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

ENV PORT=4200
EXPOSE 4200

HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=15s \
  CMD wget -O- http://localhost:4200 || exit 1

CMD ["nginx", "-g", "daemon off;"]
