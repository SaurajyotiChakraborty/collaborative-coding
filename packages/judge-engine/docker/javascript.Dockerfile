FROM node:20-alpine

WORKDIR /code

# Install language runtimes
RUN apk add --no-cache python3 py3-pip

# Security: Run as non-root
RUN addgroup -g 1001 runner && \
    adduser -D -u 1001 -G runner runner

USER runner

CMD ["node", "--version"]
