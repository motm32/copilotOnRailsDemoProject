#!/bin/bash
# POST /api/auth/login — Login and get JWT token (anonymous)
curl -i -X POST "http://localhost:7071/api/auth/login" \
  -H "Content-Type: application/json" \
  -d @sample-data.json
