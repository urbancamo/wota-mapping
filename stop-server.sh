#!/bin/bash

# Stop the WOTA Mapping API server

echo "Stopping WOTA Mapping API server..."

# Find process on port 3006
PID=$(lsof -ti:3006)

if [ -z "$PID" ]; then
    echo "No server running on port 3006"
else
    echo "Killing process $PID on port 3006"
    kill $PID
    echo "Server stopped"
fi
