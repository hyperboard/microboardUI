import winston from "winston";
import * as Drizzle from "../../../drizzle";

export class Templates {
    constructor(private logger: winston.Logger) {
    }

    async createTemplate(
        boardUUID: string,
        description: object,
        name: object,
        languages: string[],
        tags: string[],
        snapshot: object,
        viewLink: string,
        preview?: string,
    ) {
        await Drizzle.createTemplate(
            boardUUID,
            description,
            name,
            languages,
            tags,
            snapshot,
            viewLink,
            preview
        );
    }

    async saveTemplateSnapshot(
        boardUUID: string,
        snapshot: object,
    ) {
        return Drizzle.updateTemplateSnapshot(
            boardUUID,
            snapshot
        );
    }

    async getTemplates(
        language: string,
        term?: string,
        tag?: string,
    ) {
        const templates = await Drizzle.getTemplates(
            language,
            term,
            tag
        );
        return templates.map((template) => {
            template.name = template.name[language]
            template.description = template.description[language]
            return template
        });
    }
}