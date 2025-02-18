import { db } from "../../../db";
import { templates } from "../../../entities";
import { and, eq, arrayContains, sql, SQLWrapper } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { getBoardByLink, getBoardInfo } from "../Boards";
import { HttpException } from "../../../../shared/exceptions/http-exception";
import { createAccessKey, getBoardViewLink } from "../AccessKeys";
import { AccessKeyType } from "../AccessKeys/types";

export async function createTemplate(
    boardUUID: string,
    description: object,
    name: object,
    languages: string[],
    tags: string[],
    snapshot: object,
    viewLink: string,
    preview?: string
) {
    const board = await getBoardInfo(boardUUID);

    if (!board) {
        throw new Error(`Could not find board by ${boardUUID} UUID`);
    }

    const uniqId = `boards/${boardUUID}?accessKey=${viewLink}`;

    const [insertedRecords] = await db
        .insert(templates)
        .values({
            boardId: board.id,
            description,
            name,
            languages,
            uniqId,
            preview,
            tags,
            snapshot,
        })
        .returning()
        .execute();

    if (!insertedRecords) {
        throw new Error(`Error while creating template`);
    }
}

export async function updateTemplateSnapshot(boardUUID: string, snapshot: object): Promise<"updated" | "create"> {
    const board = await getBoardInfo(boardUUID);

    if (!board) {
        throw new Error(`Could not find board by ${boardUUID} UUID`);
    }

    const [updatedRecords] = await db
        .update(templates)
        .set({ snapshot })
        .where(eq(templates.boardId, board.id))
        .returning()
        .execute();

    if (!updatedRecords) {
        return "create";
    }

    return "updated";
}

export async function getTemplates(language: string, term?: string, tag?: string) {
    const filters: SQLWrapper[] = [];

    filters.push(arrayContains(templates.languages, [language]));
    if (term) {
        filters.push(sql`${templates.name} ->> ${language} ILIKE '%' || ${term} || '%'`);
    }
    if (tag) {
        filters.push(arrayContains(templates.tags, [tag]));
    }

    return db
        .select()
        .from(templates)
        .where(and(...filters));
}
