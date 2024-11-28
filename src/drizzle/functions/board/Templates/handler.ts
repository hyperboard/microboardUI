import {db} from "../../../db";
import {templates} from "../../../entities";
import {and, eq, arrayContains, sql, SQLWrapper} from "drizzle-orm";
import {createBoardViewLink, getBoardViewLink} from "../Links";
import {v4 as uuidv4} from "uuid";
import {getBoardByLink} from "../Boards";
import {HttpException} from "../../../../shared/exceptions/http-exception";

export async function createTemplate(
    boardUUID: string,
    description: object,
    name: object,
    languages: string[],
    tags: string[],
    snapshot: object,
    preview?: string,
) {
    const board = await getBoardByLink(boardUUID)

    if (!board) {
        throw new Error(`Could not find board by ${boardUUID} UUID`);
    }

    let viewLink

    try {
        viewLink = await getBoardViewLink(boardUUID)
    } catch {
        const linkId = uuidv4()
        await createBoardViewLink(board.id, linkId)
        viewLink = linkId
    }

    const [insertedRecords] = await db
        .insert(templates)
        .values({
            boardId: board.id,
            description,
            name,
            languages,
            uniqId: viewLink,
            preview,
            tags,
            snapshot
        })
        .returning()
        .execute();

    if (!insertedRecords) {
        throw new Error(`Error while creating template`);
    }
}

export async function updateTemplateSnapshot(
    boardUUID: string,
    snapshot: object,
) {
    const board = await getBoardByLink(boardUUID)

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
        throw new HttpException(404, `Board not found with UUID ${boardUUID}`);
    }
}

export async function getTemplates(
    language: string,
    term?: string,
    tag?: string
) {
    const filters: SQLWrapper[] = [];

    filters.push(arrayContains(templates.languages, [language]));
    if (term) {
        filters.push(sql`${templates.name} ->> ${language} ILIKE '%' || ${term} || '%'`)
    }
    if (tag) {
        filters.push(arrayContains(templates.tags, [tag]))
    }

    return db.select().from(templates).where(and(...filters));
}