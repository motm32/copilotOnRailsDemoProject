import { app } from "@azure/functions";
import type { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { randomUUID } from "node:crypto";
import { registerSchema } from "../../../shared/schemas/validation.js";
import { getServices } from "../services/registry.js";
import { handleError, ConflictError, ValidationError } from "../errors/index.js";
import { createdResponse } from "../utils/response.js";
import { hashPassword } from "../utils/password.js";
import type { PublicUser } from "../../../shared/types/api.js";

app.http("auth-register", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "auth/register",
  handler: registerHandler,
});

async function registerHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Invalid request body", parsed.error.flatten());
    }

    const { email, displayName, password } = parsed.data;
    const { database, auth } = getServices();

    const existing = await database.getUserByEmail(email);
    if (existing) {
      throw new ConflictError("A user with this email already exists");
    }

    const passwordHash = await hashPassword(password);
    const user = await database.createUser({
      id: randomUUID(),
      email,
      displayName,
      passwordHash,
      coupleId: null,
    });

    const token = auth.generateToken(user.id, user.email);
    const publicUser: PublicUser = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      coupleId: user.coupleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return createdResponse({ user: publicUser, token });
  } catch (err) {
    return handleError(err);
  }
}
