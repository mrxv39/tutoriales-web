# Use glibc-based Debian image for better native module compatibility
FROM node:20-bookworm-slim

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Clean install production dependencies (builds native modules in container)
RUN npm ci --omit=dev

# Copy application code (node_modules excluded via .dockerignore)
COPY . .

# Ensure /data directory exists at build time
RUN mkdir -p /data

EXPOSE 3000

CMD ["npm", "start"]
