FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY . .

RUN CI=true pnpm install

RUN pnpm -r --filter @impostor/frontend run build

FROM nginx:alpine

COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
