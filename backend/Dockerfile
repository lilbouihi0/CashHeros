# Node.js backend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Create volume for logs
VOLUME [ "/app/logs" ]

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["node", "server.js"]