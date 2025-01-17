# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (caching layer)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 9988

# Start the application
CMD ["npm", "run", "dev"]

