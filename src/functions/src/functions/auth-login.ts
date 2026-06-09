import { app } from "@azure/functions";
import type { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { loginSchema } from "../../../shared/schemas/validation.js";
import { getServices } from "../services/registry.js";
import { handleError, UnauthorizedError, ValidationError } from "../errors/index.js";
import { jsonResponse } from "../utils/response.js";
import { verifyPassword } from "../utils/password.js";
import type { PublicUser } from "../../../shared/types/api.js";

app.http("auth-login", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "auth/login",
  handler: loginHandler,
});

async function loginHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Invalid request body", parsed.error.flatten());
    }

    const { email, password } = parsed.data;
    const { database, auth } = getServices();

    const user = await database.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = auth.generateToken(user.id, user.email);
    const publicUser: PublicUser = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      coupleId: user.coupleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return jsonResponse({ user: publicUser, token });
  } catch (err) {
    return handleError(err);
  }
}
