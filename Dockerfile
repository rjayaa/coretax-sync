FROM node:18-alpine

WORKDIR /app

# Install dependencies first (caching layer)
COPY package*.json ./
RUN npm install

# Copy rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 6012

# Start the application
CMD ["npm", "start"]