import type { HttpRequest } from "@azure/functions";
import { getServices } from "../services/registry.js";
import { UnauthorizedError } from "../errors/index.js";

export interface AuthenticatedRequest {
  userId: string;
  email: string;
}

export function authenticateRequest(request: HttpRequest): AuthenticatedRequest {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    throw new UnauthorizedError("Missing Authorization header");
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new UnauthorizedError("Invalid Authorization header format");
  }

  const token = parts[1];
  const { auth } = getServices();
  const payload = auth.verifyToken(token);

  if (!payload) {
    throw new UnauthorizedError("Invalid or expired token");
  }

  return { userId: payload.userId, email: payload.email };
}
