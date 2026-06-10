#!/bin/bash
# POST /api/users — Create a new user (anonymous)
curl -i -X POST "http://localhost:7071/api/users" \
  -H "Content-Type: application/json" \
  -d @sample-data.json
