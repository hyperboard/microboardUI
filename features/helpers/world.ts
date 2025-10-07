import { IWorldOptions, World } from "@cucumber/cucumber";

export type BrowserType = "chrome" | "firefox" | "safari" | string;

interface WorldParameters {
  browser?: BrowserType;
  isSync?: boolean;
}

export class CustomWorld extends World {
  parameters: WorldParameters;

  constructor(options: IWorldOptions) {
    super(options);
    this.parameters = options.parameters as WorldParameters;
  }
}
