FROM node:20-alpine

WORKDIR /app

# Copy root files
COPY package.json package-lock.json ./
COPY tsconfig.json ./
COPY packages/backend ./packages/backend/

# Install dependencies
RUN npm ci

# Build
RUN npm run build --workspace=@impostor/backend

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "packages/backend/dist/main.js"]
