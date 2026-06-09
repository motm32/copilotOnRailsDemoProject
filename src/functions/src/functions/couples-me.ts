import { app } from "@azure/functions";
import type { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getServices } from "../services/registry.js";
import { handleError, NotFoundError } from "../errors/index.js";
import { authenticateRequest } from "../middleware/auth.js";
import { jsonResponse } from "../utils/response.js";
import type { PublicUser } from "../../../shared/types/api.js";

app.http("couples-me", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "couples/me",
  handler: coupleMeHandler,
});

async function coupleMeHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticateRequest(request);
    const { database } = getServices();

    const couple = await database.getCoupleByUserId(userId);
    if (!couple) {
      throw new NotFoundError("You are not in a couple");
    }

    const partnerId = couple.user1Id === userId ? couple.user2Id : couple.user1Id;
    const partner = await database.getUserById(partnerId);
    if (!partner) {
      throw new NotFoundError("Partner not found");
    }

    const publicPartner: PublicUser = {
      id: partner.id,
      email: partner.email,
      displayName: partner.displayName,
      coupleId: partner.coupleId,
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
    };

    return jsonResponse({ couple, partner: publicPartner });
  } catch (err) {
    return handleError(err);
  }
}
