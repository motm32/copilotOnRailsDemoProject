#!/bin/bash
# POST /api/photos/{id}/caption — Generate AI caption for a photo (requires auth)
# Replace <token> with a JWT from the login endpoint
# Replace PHOTO_ID with an actual photo ID
curl -i -X POST "http://localhost:7071/api/photos/PHOTO_ID/caption" \
  -H "Authorization: Bearer <token>"
