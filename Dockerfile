# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Build with baseHref
RUN npm run build -- --base-href=/finance/

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev && \
    npm cache clean --force

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4200

EXPOSE 4200

HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=15s \
  CMD node -e "require('http').get('http://localhost:4200', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "dist/front-angular-crm_finances/server/server.mjs"]
