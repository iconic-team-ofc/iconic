# Dockerfile

# 1. Builder: instala dependências e compila
FROM node:18-alpine AS builder
WORKDIR /usr/src/app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./
RUN npm run build

# 2. Runner: só o que é necessário para executar
FROM node:18-alpine AS runner
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/backend/dist ./dist
COPY --from=builder /usr/src/app/backend/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]
