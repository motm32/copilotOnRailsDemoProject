import { app } from "@azure/functions";
import type { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { randomUUID } from "node:crypto";
import { joinCoupleSchema } from "../../../shared/schemas/validation.js";
import { getServices } from "../services/registry.js";
import {
  handleError,
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../errors/index.js";
import { authenticateRequest } from "../middleware/auth.js";
import { jsonResponse } from "../utils/response.js";

app.http("couples-join", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "couples/join",
  handler: joinHandler,
});

async function joinHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticateRequest(request);
    const body = await request.json();
    const parsed = joinCoupleSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Invalid request body", parsed.error.flatten());
    }

    const { inviteCode } = parsed.data;
    const { database } = getServices();

    // Check if joiner already in a couple
    const existingCouple = await database.getCoupleByUserId(userId);
    if (existingCouple) {
      throw new ConflictError("You are already in a couple");
    }

    const invite = await database.getInviteCodeByCode(inviteCode);
    if (!invite) {
      throw new NotFoundError("Invite code not found");
    }

    if (invite.usedBy) {
      throw new ConflictError("This invite code has already been used");
    }

    if (invite.expiresAt < new Date()) {
      throw new NotFoundError("This invite code has expired");
    }

    if (invite.createdBy === userId) {
      throw new ConflictError("You cannot use your own invite code");
    }

    // Create couple in a transaction
    const couple = await database.transaction(async (tx) => {
      const coupleId = randomUUID();
      const newCouple = await tx.createCouple({
        id: coupleId,
        user1Id: invite.createdBy,
        user2Id: userId,
      });

      await tx.updateUser(invite.createdBy, { coupleId });
      await tx.updateUser(userId, { coupleId });
      await tx.markInviteCodeUsed(invite.id, userId);

      return newCouple;
    });

    return jsonResponse({ couple });
  } catch (err) {
    return handleError(err);
  }
}
