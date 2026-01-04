# Use official Node.js 18 image
FROM node:18-slim

# Install PostgreSQL client
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (using npm install instead of npm ci)
RUN npm install --legacy-peer-deps

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose port (Railway will inject PORT env variable)
EXPOSE ${PORT:-5000}

# Start command
CMD ["npm", "start"]
