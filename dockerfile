# 1. Etapa de build
FROM node:18-alpine AS builder

# Diretório de trabalho
WORKDIR /usr/src/app/backend

# Copia arquivos de dependência
COPY backend/package*.json ./

# Instala todas as dependências (inclusive dev) com workaround para peer deps
RUN npm install --legacy-peer-deps

# Copia todo o código-fonte
COPY backend/ ./

# Compila a aplicação
RUN npm run build

# 2. Etapa de execução
FROM node:18-alpine AS runner

# Define diretório de trabalho
WORKDIR /usr/src/app

# Copia apenas os arquivos necessários da etapa anterior
COPY --from=builder /usr/src/app/backend/dist ./dist
COPY --from=builder /usr/src/app/backend/node_modules ./node_modules
COPY --from=builder /usr/src/app/backend/package.json ./

# Expõe a porta da aplicação
EXPOSE 3000

# Comando de inicialização da aplicação
CMD ["node", "dist/main.js"]
