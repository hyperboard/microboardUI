export const environment = {
    DB_NAME: process.env.DB_NAME,
} as const;

export class Config {
    public environment = {
        DB_PORT: process.env.DB_PORT || "5432",
        DB_USER: process.env.DB_USER || null,
        DB_PASSWORD: process.env.DB_PASSWORD || null,
        DB_NAME: process.env.DB_NAME || null,
        DB_HOST: process.env.DB_HOST || null,
        JWT_SECRET: process.env.JWT_SECRET || null,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || null,
        MAILER_USER: process.env.MAILER_USER || "user",
        MAILER_PASSWORD: process.env.MAILER_PASSWORD || "password",
    };

    constructor() {
        Object.entries(this.environment).some(([key, value]) => {
            if (value === null) {
                throw new Error(
                    `process.env.${key} not found. Need to explicitly set it`
                );
            }
        });
    }
}
