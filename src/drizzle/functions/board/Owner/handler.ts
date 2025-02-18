import { eq } from "drizzle-orm";
import { db } from "drizzle/db";
import { boardOwner, boards } from "drizzle/entities";

/**
 * Function to add an owner to a board.
 */
export async function addBoardOwner(authorUUID: string, ownerId: number) {
    const boardRecords = await db
        .select({ id: boards.id })
        .from(boards)
        .where(eq(boards.authorUUID, authorUUID))
        .execute();

    if (boardRecords.length === 0) {
        throw new Error(`Board with author_key ${authorUUID} does not exist`);
    }

    const boardId = boardRecords[0].id;

    await db.insert(boardOwner).values({ boardId: boardId, ownerId: ownerId }).execute();
}
