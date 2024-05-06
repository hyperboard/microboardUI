import { resources, defaultNS } from "./Lang";

declare module "i18next" {
	interface CustomTypeOptions {
		defaultNS: typeof defaultNS;
		resources: typeof resources["en"];
	}
}
