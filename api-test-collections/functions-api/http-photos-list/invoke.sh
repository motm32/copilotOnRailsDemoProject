#!/bin/bash
# GET /api/photos — List photos (requires auth)
# Replace <token> with a JWT from the login endpoint
curl -i "http://localhost:7071/api/photos" \
  -H "Authorization: Bearer <token>"
