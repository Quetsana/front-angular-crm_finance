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

# Remover configuración por defecto
RUN rm /etc/nginx/conf.d/default.conf

# Agregar configuración para SPA
RUN echo 'server {\n\
    listen 4200;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf

ENV PORT=4200
EXPOSE 4200

HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=15s \
  CMD wget -O- http://localhost:4200 || exit 1

CMD ["nginx", "-g", "daemon off;"]
