FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY tsconfig.json ./
COPY packages/backend ./packages/backend/

RUN pnpm install --frozen-lockfile

RUN pnpm -r run build --filter @impostor/backend

EXPOSE 3000

CMD ["node", "packages/backend/dist/main.js"]
