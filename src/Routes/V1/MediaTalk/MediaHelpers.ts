import { SupportedFormats, SupportedRaster, SupportedVector } from "./types";

export const supportedRasters = ["image/png", "image/jpeg", "image/webp"] as const;
export const supportedVector = ["image/svg+xml"] as const;

export function isSupportedRaster(format: string): format is SupportedRaster {
    return supportedRasters.includes(format as SupportedRaster);
}

export function isSupportedVector(format: string): format is SupportedVector {
    return supportedVector.includes(format as SupportedVector);
}

export function isAllowedFormat(format: string): format is SupportedFormats {
    return isSupportedRaster(format) || isSupportedVector(format);
}

export function getImageFormat(base64: string): SupportedFormats | "unknown" {
    // Check if the base64 string contains a MIME type
    const mimeTypeMatch = base64.match(/^data:(.*?);base64,/);
    if (mimeTypeMatch) {
        const mimeType = mimeTypeMatch[1];
        if (isAllowedFormat(mimeType)) {
            return mimeType;
        }
        return "unknown";
    }

    // Fallback to checking the base64 header
    const header = base64.substring(0, 12);
    if (header.startsWith("iVBORw0K")) {
        return "image/png";
    } else if (header.startsWith("PD94bW") || header.startsWith("PHN2Z")) {
        return "image/svg+xml";
    }
    return "unknown";
}
