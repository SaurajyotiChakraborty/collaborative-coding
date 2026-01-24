FROM eclipse-temurin:17-jdk-alpine

WORKDIR /code

# Security: Run as non-root
RUN addgroup -g 1001 runner && \
    adduser -D -u 1001 -G runner runner

USER runner

CMD ["java", "--version"]
