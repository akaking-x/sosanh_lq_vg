FROM node:20-alpine

WORKDIR /app

# Install server dependencies
COPY package*.json ./
RUN npm ci --only=production

# Install client dependencies and build
COPY client/package*.json ./client/
RUN cd client && npm ci
COPY client/ ./client/
RUN cd client && npm run build

# Copy server code
COPY server/ ./server/
COPY scripts/ ./scripts/
COPY data/ ./data/

EXPOSE 5000

CMD ["node", "server/index.js"]
