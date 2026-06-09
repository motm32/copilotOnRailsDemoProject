export interface AppConfig {
    storageConnectionString: string;
    databaseUrl: string;
    azureOpenAiEndpoint: string;
    azureOpenAiApiKey: string;
    authSecret: string;
}

export function loadConfig(): AppConfig {
    const required = (key: string): string => {
        const value = process.env[key];
        if (!value) throw new Error(`Missing required environment variable: ${key}`);
        return value;
    };

    const optional = (key: string, fallback: string): string => {
        return process.env[key] || fallback;
    };

    return {
        storageConnectionString: required('STORAGE_CONNECTION_STRING'),
        databaseUrl: required('DATABASE_URL'),
        azureOpenAiEndpoint: optional('AZURE_OPENAI_ENDPOINT', ''),
        azureOpenAiApiKey: optional('AZURE_OPENAI_API_KEY', ''),
        authSecret: required('AUTH_SECRET'),
    };
}
