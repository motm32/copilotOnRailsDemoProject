export interface AppConfig {
  storageConnectionString: string;
  databaseUrl: string;
  authSecret: string;
  azureOpenAiEndpoint: string | null;
  azureOpenAiApiKey: string | null;
  port: number;
}

let cachedConfig: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (cachedConfig) return cachedConfig;

  const storageConnectionString =
    process.env.STORAGE_CONNECTION_STRING ?? "UseDevelopmentStorage=true";
  const databaseUrl =
    process.env.DATABASE_URL ??
    "postgresql://localdev:localdevpassword@localhost:5432/scrapbookdb";
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) {
    throw new Error("AUTH_SECRET environment variable is required");
  }

  cachedConfig = {
    storageConnectionString,
    databaseUrl,
    authSecret,
    azureOpenAiEndpoint: process.env.AZURE_OPENAI_ENDPOINT ?? null,
    azureOpenAiApiKey: process.env.AZURE_OPENAI_API_KEY ?? null,
    port: parseInt(process.env.PORT ?? "7071", 10),
  };

  return cachedConfig;
}
