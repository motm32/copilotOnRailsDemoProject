#!/bin/bash
# GET /api/pair/status — Get pair status (requires auth)
# Replace <token> with a JWT from the login endpoint
curl -i "http://localhost:7071/api/pair/status" \
  -H "Authorization: Bearer <token>"
