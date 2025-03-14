# -----------------------------
# STAGE 1: Build
# -----------------------------
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# -----------------------------
# STAGE 2: Production
# -----------------------------
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
EXPOSE 5000

CMD ["npm", "start"]
