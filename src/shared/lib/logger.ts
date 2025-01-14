import winston from "winston";

const levels = ["error", "warn", "info", "http", "verbose", "debug", "silly"];

export function getLoggerLevel(level: string | undefined): winston.level {
    if (level && levels.includes(level)) {
        return level as winston.level;
    }
    return "info";
}
