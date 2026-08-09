FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY . .

RUN CI=true pnpm install

ARG VITE_API_URL=
ARG VITE_SOCKET_URL=

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}

RUN pnpm -r --filter @impostor/frontend run build

FROM nginx:alpine

RUN apk add --no-cache openssl

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Generate self-signed cert as fallback (for development)
RUN openssl req -x509 -newkey rsa:2048 -keyout /etc/nginx/ssl/privkey.pem \
    -out /etc/nginx/ssl/fullchain.pem -days 365 -nodes \
    -subj "/C=US/ST=State/L=City/O=Org/CN=localhost"

COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

COPY nginx.dev.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
