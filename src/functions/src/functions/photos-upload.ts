import { app } from "@azure/functions";
import type { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { randomUUID } from "node:crypto";
import { getServices } from "../services/registry.js";
import { handleError, ValidationError, ForbiddenError } from "../errors/index.js";
import { authenticateRequest } from "../middleware/auth.js";
import { createdResponse } from "../utils/response.js";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const CONTAINER_NAME = "photos";

app.http("photos-upload", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "photos",
  handler: uploadHandler,
});

async function uploadHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticateRequest(request);
    const { database, storage, caption } = getServices();

    // Check user is in a couple
    const couple = await database.getCoupleByUserId(userId);
    if (!couple) {
      throw new ForbiddenError("You must be in a couple to upload photos");
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      throw new ValidationError("A file is required");
    }

    const mimeType = file.type;
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new ValidationError(
        `Invalid file type: ${mimeType}. Allowed: ${[...ALLOWED_MIME_TYPES].join(", ")}`
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > MAX_FILE_SIZE) {
      throw new ValidationError("File size exceeds 10MB limit");
    }

    const photoId = randomUUID();
    const extension = mimeType.split("/")[1];
    const blobName = `${couple.id}/${photoId}.${extension}`;

    const blobUrl = await storage.upload(CONTAINER_NAME, blobName, buffer, mimeType);

    // Generate AI caption (enhancement — fallback on failure)
    const generatedCaption = await caption.generateCaption(buffer, mimeType);

    const photo = await database.createPhoto({
      id: photoId,
      coupleId: couple.id,
      uploadedBy: userId,
      blobUrl,
      caption: generatedCaption,
      mimeType,
      sizeBytes: buffer.length,
    });

    return createdResponse({ photo });
  } catch (err) {
    return handleError(err);
  }
}
