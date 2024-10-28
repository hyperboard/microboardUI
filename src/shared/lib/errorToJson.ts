export function errorToJson(error: any) {
    const e = {
        message: error.message || "Unknown error",
        stack: error.stack || "Unknown stack",
        name: error.name || "Unknown name",
        ...(error.code && { code: error.code }),
    };

    return JSON.stringify(e, null, 4);
}

export function parseError(error: any) {
    return {
        message: error.message || "Unknown error",
        stack: error.stack || "Unknown stack",
        name: error.name || "Unknown name",
        ...(error.code && { code: error.code }),
    };
}
