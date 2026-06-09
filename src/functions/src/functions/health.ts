import { app } from "@azure/functions";
import type { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getServices } from "../services/registry.js";
import { jsonResponse } from "../utils/response.js";
import type { HealthResponse, HealthServiceStatus } from "../../../shared/types/api.js";

app.http("health", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "health",
  handler: healthHandler,
});

async function healthHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const { storage, database } = getServices();

  const [storageHealth, databaseHealth] = await Promise.all([
    storage.healthCheck(),
    database.healthCheck(),
  ]);

  const services: Record<string, HealthServiceStatus> = {
    storage: storageHealth,
    database: databaseHealth,
  };

  const statuses = Object.values(services).map((s) => s.status);
  const allHealthy = statuses.every((s) => s === "healthy");
  const allUnhealthy = statuses.every((s) => s === "unhealthy");

  let overallStatus: HealthResponse["status"];
  if (allHealthy) {
    overallStatus = "healthy";
  } else if (allUnhealthy) {
    overallStatus = "unhealthy";
  } else {
    overallStatus = "degraded";
  }

  const body: HealthResponse = { status: overallStatus, services };
  const statusCode = overallStatus === "unhealthy" ? 503 : 200;

  return jsonResponse(body, statusCode);
}
