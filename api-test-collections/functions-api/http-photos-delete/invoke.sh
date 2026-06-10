#!/bin/bash
# DELETE /api/photos/{id} — Delete a photo (requires auth)
# Replace <token> with a JWT from the login endpoint
# Replace PHOTO_ID with an actual photo ID
curl -i -X DELETE "http://localhost:7071/api/photos/PHOTO_ID" \
  -H "Authorization: Bearer <token>"
