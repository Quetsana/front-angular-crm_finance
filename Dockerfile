# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Build Angular app
RUN npm run build

# Stage 2: Runtime - Serve static files with simple Node server
FROM node:20-alpine

WORKDIR /app

RUN npm install -g http-server

COPY --from=builder /app/dist/front-angular-crm_finances/browser ./public

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4200

EXPOSE 4200

HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=15s \
  CMD wget -O- http://localhost:4200 || exit 1

CMD ["http-server", "public", "-p", "4200", "-c-1", "--spa", "--gzip"]
