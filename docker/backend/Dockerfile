# Development Stage
FROM node:20-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "start:dev"]

# Production Stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application
COPY --from=development /app/dist ./dist
COPY --from=development /app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 3000

# Start production server
CMD ["node", "dist/main"]
