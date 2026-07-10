FROM node:18-alpine

WORKDIR /app

# Install deps
COPY package.json package-lock.json ./
RUN npm ci --production

# Copy prisma schema early to run prisma generate
COPY prisma ./prisma

# Copy rest
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Make entrypoint executable
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3333

ENTRYPOINT ["/app/docker-entrypoint.sh"]
