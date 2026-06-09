import { app } from "@azure/functions";
import type { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getServices } from "../services/registry.js";
import { handleError } from "../errors/index.js";
import { authenticateRequest } from "../middleware/auth.js";
import { jsonResponse } from "../utils/response.js";
import type { PublicUser } from "../../../shared/types/api.js";

app.http("auth-me", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "auth/me",
  handler: meHandler,
});

async function meHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticateRequest(request);
    const { database } = getServices();

    const user = await database.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const publicUser: PublicUser = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      coupleId: user.coupleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return jsonResponse({ user: publicUser });
  } catch (err) {
    return handleError(err);
  }
}
