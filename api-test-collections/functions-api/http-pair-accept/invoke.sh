#!/bin/bash
# POST /api/pair/accept — Accept pair invite (requires auth)
# Replace <token> with a JWT from the login endpoint
curl -i -X POST "http://localhost:7071/api/pair/accept" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d @sample-data.json
