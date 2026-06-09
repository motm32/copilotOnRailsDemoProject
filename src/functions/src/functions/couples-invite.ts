import { app } from "@azure/functions";
import type { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { randomUUID, randomBytes } from "node:crypto";
import { getServices } from "../services/registry.js";
import { handleError, ConflictError } from "../errors/index.js";
import { authenticateRequest } from "../middleware/auth.js";
import { createdResponse } from "../utils/response.js";

const INVITE_EXPIRY_HOURS = 24;

app.http("couples-invite", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "couples/invite",
  handler: inviteHandler,
});

async function inviteHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticateRequest(request);
    const { database } = getServices();

    // Check if user already has a couple
    const existingCouple = await database.getCoupleByUserId(userId);
    if (existingCouple) {
      throw new ConflictError("You are already in a couple");
    }

    // Check for active invite
    const activeInvite = await database.getActiveInviteByUser(userId);
    if (activeInvite) {
      return createdResponse({
        inviteCode: activeInvite.code,
        expiresAt: activeInvite.expiresAt.toISOString(),
      });
    }

    const code = randomBytes(4).toString("hex").toUpperCase();
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000);

    const invite = await database.createInviteCode({
      id: randomUUID(),
      code,
      createdBy: userId,
      usedBy: null,
      expiresAt,
    });

    return createdResponse({
      inviteCode: invite.code,
      expiresAt: invite.expiresAt.toISOString(),
    });
  } catch (err) {
    return handleError(err);
  }
}
