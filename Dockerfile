# Base image
FROM node:20-alpine AS base

# Install OpenSSL and libc6-compat (required by Prisma client and next.js build)
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV PORT 3000
ENV NODE_ENV production

# Run database migrations and start the application
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
