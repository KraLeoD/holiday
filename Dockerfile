# Build stage runs on amd64 only — the output is platform-independent JS
FROM --platform=linux/amd64 node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json .npmrc ./
RUN npm ci

FROM --platform=linux/amd64 node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build:web && npm run build:server

# Production stage is multi-arch (amd64 + arm64)
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache tini
RUN mkdir -p /data

COPY package.json package-lock.json .npmrc ./
RUN apk add --no-cache python3 make g++ && \
    npm ci --omit=dev && \
    apk del python3 make g++

COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/dist ./dist

EXPOSE 3000
ENV PORT=3000
ENV DB_PATH=/data/calendar.db
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server/dist/index.js"]
