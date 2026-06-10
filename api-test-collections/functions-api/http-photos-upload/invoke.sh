#!/bin/bash
# POST /api/photos/upload — Upload a photo (requires auth)
# Replace <token> with a JWT from the login endpoint
curl -i -X POST "http://localhost:7071/api/photos/upload" \
  -H "Authorization: Bearer <token>" \
  -F "file=@sample-photo.jpg"
