import { app } from "@azure/functions";
import type { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getServices } from "../services/registry.js";
import { handleError, NotFoundError, ForbiddenError } from "../errors/index.js";
import { authenticateRequest } from "../middleware/auth.js";
import { jsonResponse } from "../utils/response.js";

app.http("photos-get", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "photos/{id}",
  handler: getPhotoHandler,
});

async function getPhotoHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticateRequest(request);
    const photoId = request.params.id;
    const { database } = getServices();

    const couple = await database.getCoupleByUserId(userId);
    if (!couple) {
      throw new ForbiddenError("You must be in a couple to view photos");
    }

    const photo = await database.getPhotoById(photoId);
    if (!photo) {
      throw new NotFoundError("Photo not found");
    }

    if (photo.coupleId !== couple.id) {
      throw new ForbiddenError("You do not have access to this photo");
    }

    return jsonResponse({ photo });
  } catch (err) {
    return handleError(err);
  }
}
