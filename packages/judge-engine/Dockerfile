# Docker-based Code Execution Service

FROM node:20-alpine

WORKDIR /executor

# Install Python and Java for multi-language support
RUN apk add --no-cache python3 py3-pip openjdk17

# Copy package files
COPY package*.json ./
RUN npm install --production

# Copy execution scripts
COPY src/ ./src/

# Create isolated execution directory
RUN mkdir -p /sandbox && chmod 755 /sandbox

# Security: Run as non-root user
RUN addgroup -g 1001 executor && \
    adduser -D -u 1001 -G executor executor && \
    chown -R executor:executor /executor /sandbox

USER executor

CMD ["node", "src/index.js"]
