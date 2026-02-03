#!/bin/bash

# Start the WOTA Mapping API server

# Ensure repo-based git hooks are active
git config core.hooksPath .githooks

echo "Starting WOTA Mapping API server..."

cd server

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the server
node server.js
