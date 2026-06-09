import { app } from "@azure/functions";
import type { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getServices } from "../services/registry.js";
import { handleError, NotFoundError, ForbiddenError } from "../errors/index.js";
import { authenticateRequest } from "../middleware/auth.js";
import { jsonResponse } from "../utils/response.js";

app.http("photos-delete", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "photos/{id}",
  handler: deletePhotoHandler,
});

async function deletePhotoHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticateRequest(request);
    const photoId = request.params.id;
    const { database, storage } = getServices();

    const couple = await database.getCoupleByUserId(userId);
    if (!couple) {
      throw new ForbiddenError("You must be in a couple to delete photos");
    }

    const photo = await database.getPhotoById(photoId);
    if (!photo) {
      throw new NotFoundError("Photo not found");
    }

    if (photo.coupleId !== couple.id) {
      throw new ForbiddenError("You do not have access to this photo");
    }

    // Extract blob name from URL
    const url = new URL(photo.blobUrl);
    const blobPath = url.pathname.split("/").slice(2).join("/"); // Remove container prefix
    await storage.delete("photos", blobPath);
    await database.deletePhoto(photoId);

    return jsonResponse({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
