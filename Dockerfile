# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Runtime - Nginx
FROM nginx:alpine

# Copiar los archivos compilados
COPY --from=builder /app/dist/front-angular-crm_finances/browser /usr/share/nginx/html

# Configurar nginx para SPA
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 4200;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Caché de archivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback - servir index.html para cualquier ruta
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

ENV PORT=4200
EXPOSE 4200

HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=15s \
  CMD wget -O- http://localhost:4200 || exit 1

CMD ["nginx", "-g", "daemon off;"]
