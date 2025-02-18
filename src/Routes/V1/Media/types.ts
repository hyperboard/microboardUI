import { supportedRasters, supportedVector } from "./MediaHelpers";

export type SupportedRaster = typeof supportedRasters[number];
export type SupportedVector = typeof supportedVector[number];

export type SupportedFormats = SupportedRaster | SupportedVector;
