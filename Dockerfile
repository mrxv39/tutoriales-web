FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

# Ensure /data directory exists at build time
RUN mkdir -p /data

EXPOSE 3000

CMD ["npm", "start"]
