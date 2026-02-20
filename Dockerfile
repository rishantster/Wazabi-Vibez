FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY wazabi-social/package.json wazabi-social/package-lock.json ./wazabi-social/
WORKDIR /app/wazabi-social
RUN npm ci

FROM base AS builder
WORKDIR /app/wazabi-social
COPY --from=deps /app/wazabi-social/node_modules ./node_modules
COPY wazabi-social/ ./
RUN npx prisma generate && npm run build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app/wazabi-social
COPY --from=builder /app/wazabi-social ./
EXPOSE 3000
CMD ["sh", "-c", "npm run start -- -p ${PORT:-3000}"]
