export {};

declare global {
  namespace NodeJS {
    interface ImportMeta {
      env: {
        FALLBACK_LNG: string;
        NODE_ENV: "development" | "production";
      };
    }
  }
}

interface ImportMeta {
  readonly env: {
    FALLBACK_LNG: string;
    NODE_ENV: "development" | "production";
    TOLGEE_API_URL?: string;
    TOLGEE_API_KEY?: string;
    TOLGEE_PROJECT_ID?: string;
  };
}
