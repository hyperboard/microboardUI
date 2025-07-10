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
