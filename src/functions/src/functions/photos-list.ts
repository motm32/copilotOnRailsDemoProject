import { app } from "@azure/functions";
import type { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getServices } from "../services/registry.js";
import { handleError, ForbiddenError } from "../errors/index.js";
import { authenticateRequest } from "../middleware/auth.js";
import { jsonResponse } from "../utils/response.js";

app.http("photos-list", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "photos",
  handler: listHandler,
});

async function listHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticateRequest(request);
    const { database } = getServices();

    const couple = await database.getCoupleByUserId(userId);
    if (!couple) {
      throw new ForbiddenError("You must be in a couple to view photos");
    }

    const photos = await database.getPhotosByCoupleId(couple.id);

    return jsonResponse({ photos, total: photos.length });
  } catch (err) {
    return handleError(err);
  }
}
