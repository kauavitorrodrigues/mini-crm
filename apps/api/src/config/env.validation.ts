export const ENV_KEYS = {
    databaseUrl: "DATABASE_URL",
    jwtSecret: "JWT_SECRET",
    frontendUrl: "FRONTEND_URL",
    serverPort: "SERVER_PORT",
} as const;

export interface EnvConfig {
    DATABASE_URL: string;
    JWT_SECRET: string;
    FRONTEND_URL: string;
    SERVER_PORT: string;
}

export const validateEnv = (config: Record<string, unknown>): EnvConfig => {
    for (const key of Object.values(ENV_KEYS)) {
        if (!config[key]) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
    }
    if (String(config[ENV_KEYS.jwtSecret]).length < 32) {
        throw new Error("JWT_SECRET must be at least 32 characters long");
    }
    return config as unknown as EnvConfig;
};
