#!/bin/bash

echo "🐳 Building Docker images for code execution..."

cd "$(dirname "$0")"

# Build JavaScript image
echo "Building JavaScript image..."
docker build -t judge-js -f javascript.Dockerfile .

# Build Python image
echo "Building Python image..."
docker build -t judge-python -f python.Dockerfile .

# Build Java image
echo "Building Java image..."
docker build -t judge-java -f java.Dockerfile .

echo "✅ All images built successfully!"
echo ""
echo "Images created:"
docker images | grep "judge-"
