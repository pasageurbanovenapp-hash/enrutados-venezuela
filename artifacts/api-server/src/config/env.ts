export interface AppConfig {
  port: number;
  corsOrigins: string[];
}

export function loadConfig(env: NodeJS.ProcessEnv): AppConfig {
  const rawPort = env.PORT;

  if (!rawPort) {
    throw new Error(
      'PORT environment variable is required but was not provided.',
    );
  }

  const port = Number(rawPort);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  const corsOrigins = (env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (env.NODE_ENV === "production" && corsOrigins.length === 0) {
    throw new Error(
      "CORS_ORIGINS environment variable is required in production.",
    );
  }

  return {
    port,
    corsOrigins:
      corsOrigins.length > 0
        ? corsOrigins
        : ["http://localhost:5173", "http://127.0.0.1:5173"],
  };
}