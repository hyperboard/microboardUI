import type { NextFunction, Request, Response } from "express";

const validLangs = ["en", "ru"] as const;
const defaultLang = validLangs[0];

export type Lang = typeof validLangs[number];

export const language = (lngHeader: string) => (req: Request, _res: Response, next: NextFunction) => {
    const clientLang = req.headers[lngHeader] ?? defaultLang;
    req.lang = typeof clientLang === "string" && validLangs.includes(clientLang as Lang) ? clientLang : defaultLang;
    next();
};
