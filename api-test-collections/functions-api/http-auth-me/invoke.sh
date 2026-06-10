#!/bin/bash
# GET /api/auth/me — Get current user info (requires auth)
# Replace <token> with a JWT from the login endpoint
curl -i "http://localhost:7071/api/auth/me" \
  -H "Authorization: Bearer <token>"
