# builder
FROM node:22-alpine AS builder

WORKDIR /app

# Install build deps for node-gyp / better-sqlite3
RUN apk add --no-cache \
    python3 \
    build-base \
    sqlite-dev \
    linux-headers

# Ensure node-gyp finds python3 via environment variable
ENV PYTHON=/usr/bin/python3

COPY package.json package-lock.json ./
# Install all deps (including dev deps needed for the build)
RUN npm ci

COPY . .
RUN npm run build

# runtime
FROM node:22-alpine AS runner

WORKDIR /app

# Copy production artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server/db/schema.sql ./server/db/schema.sql

# create data dirs for sqlite and uploads
RUN mkdir -p data server/uploads

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
