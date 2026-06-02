FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY tsconfig.json ./
COPY packages/frontend ./packages/frontend/

RUN pnpm install --frozen-lockfile

RUN pnpm -r run build --filter @impostor/frontend

FROM nginx:alpine

COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
