FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm && apk add --no-cache curl

COPY . .

RUN CI=true pnpm install

RUN pnpm -r --filter @impostor/backend run build

EXPOSE 3000

CMD ["node", "packages/backend/dist/main.js"]
