FROM python:3.11-alpine

WORKDIR /code

# Security: Run as non-root
RUN addgroup -g 1001 runner && \
    adduser -D -u 1001 -G runner runner

USER runner

CMD ["python3", "--version"]
