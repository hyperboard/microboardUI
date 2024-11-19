import {
    users,
    userNames,
    userPasswords,
    boards,
    boardOwner,
    boardPermissions,
    boardEvents,
    boardSnapshots,
    boardEditLink,
    boardViewLink,
    userEditLink,
    userViewLink,
    userPasscodes,
    userPasswordResetRequests,
} from "../entities";
import { db } from "../db"; // Import your schema

import { board1eventsJson } from "./events/board1";
import { board2eventsJson } from "./events/board2";
import { snapshot1 } from "./events/snapshot1";
import { and, eq } from "drizzle-orm";
import { snapshot2 } from "./events/snapshot2";

const BOARD_UUID1 = "00000000-0000-0000-0000-000000000001";
const BOARD_UUID2 = "00000000-0000-0000-0000-000000000002";
const AUTHOR_UUID1 = "00000000-0000-0000-0000-000000000011";
const AUTHOR_UUID2 = "00000000-0000-0000-0000-000000000012";
const EDIT_LINK_UUID1 = "00000000-0000-0000-0000-000000000021";
const EDIT_LINK_UUID2 = "00000000-0000-0000-0000-000000000022";
const VIEW_LINK_UUID1 = "00000000-0000-0000-0000-000000000031";
const VIEW_LINK_UUID2 = "00000000-0000-0000-0000-000000000032";
const USER_EDIT_LINK_UUID1 = "00000000-0000-0000-0000-000000000041";
const USER_EDIT_LINK_UUID2 = "00000000-0000-0000-0000-000000000042";
const USER_VIEW_LINK_UUID1 = "00000000-0000-0000-0000-000000000051";
const USER_VIEW_LINK_UUID2 = "00000000-0000-0000-0000-000000000052";
const USER_PASSCODE = "000000";
const RESET_TOKEN1 = "00000000-0000-0000-0000-000000000061";
const RESET_TOKEN2 = "00000000-0000-0000-0000-000000000062";

async function index() {
    const { NODE_ENV } = process.env;
    if (NODE_ENV !== "development") {
        throw new Error("WARNING! Use seed only in development mode!");
    }

    console.log("1/15 - Seeding database...");

    // Seed users
    await Promise.all([
        db.delete(users).where(eq(users.email, "user1@example.com")).execute(),
        db.delete(users).where(eq(users.email, "user2@example.com")).execute(),
    ]);
    const [user1, user2] = await Promise.all([
        db
            .insert(users)
            .values({
                email: "user1@example.com",
                activated: true,
                refreshToken: "refreshToken1",
            })
            // .onConflictDoNothing({ target: users.email })
            .returning(),
        db
            .insert(users)
            .values({
                email: "user2@example.com",
                activated: true,
                refreshToken: "refreshToken2",
            })
            // .onConflictDoNothing({ target: users.email })
            .returning(),
    ]);

    console.log("2/15 - Seeding usernames...");
    // Seed usernames
    await Promise.all([
        db.delete(userNames).where(eq(userNames.userId, user1[0].id)).execute(),
        db.delete(userNames).where(eq(userNames.userId, user2[0].id)).execute(),
    ]);
    await Promise.all([
        db.insert(userNames).values({ userId: user1[0].id, name: "User One" }),
        db.insert(userNames).values({ userId: user2[0].id, name: "User Two" }),
    ]);

    console.log("3/15 - Seeding passwords...");
    // Seed user passwords (hashed)
    await Promise.all([
        db.delete(userPasswords).where(eq(userPasswords.userId, user1[0].id)).execute(),
        db.delete(userPasswords).where(eq(userPasswords.userId, user2[0].id)).execute(),
    ]);
    await Promise.all([
        db.insert(userPasswords).values({ userId: user1[0].id, password: "hashedPassword1" }),
        db.insert(userPasswords).values({ userId: user2[0].id, password: "hashedPassword2" }),
    ]);

    console.log("4/15 - Seeding boards...");
    // Seed boards
    await Promise.all([
        db.delete(boardSnapshots).where(eq(boardSnapshots.boardUUID, BOARD_UUID1)).execute(),
        db.delete(boardSnapshots).where(eq(boardSnapshots.boardUUID, BOARD_UUID2)).execute(),
        db.delete(boards).where(eq(boards.boardUUID, BOARD_UUID1)),
        db.delete(boards).where(eq(boards.boardUUID, BOARD_UUID2)),
    ]);
    const [board1, board2] = await Promise.all([
        db
            .insert(boards)
            .values({
                boardName: "Board 1",
                boardUUID: BOARD_UUID1,
                authorUUID: AUTHOR_UUID1,
            })
            .onConflictDoNothing({ target: [boards.boardUUID] })
            .returning(),
        db
            .insert(boards)
            .values({
                boardName: "Board 2",
                boardUUID: BOARD_UUID2,
                authorUUID: AUTHOR_UUID2,
            })
            .onConflictDoNothing({ target: [boards.boardUUID] })
            .returning(),
    ]);

    console.log("5/15 - Seeding board owners...");
    // Seed board owners
    await Promise.all([
        db.delete(boardOwner).where(eq(boardOwner.boardId, board1[0].id)),
        db.delete(boardOwner).where(eq(boardOwner.boardId, board2[0].id)),
    ]);
    await Promise.all([
        db
            .insert(boardOwner)
            .values({ boardId: board1[0].id, ownerId: user1[0].id })
            .onConflictDoNothing({
                target: [boardOwner.boardId, boardOwner.ownerId],
            }),
        db
            .insert(boardOwner)
            .values({ boardId: board2[0].id, ownerId: user2[0].id })
            .onConflictDoNothing({
                target: [boardOwner.boardId, boardOwner.ownerId],
            }),
    ]);

    console.log("6/15 - Seeding board permissions...");
    // Seed board permissions
    await Promise.all([
        db.delete(boardPermissions).where(eq(boardPermissions.boardId, board1[0].id)),
        db.delete(boardPermissions).where(eq(boardPermissions.boardId, board2[0].id)),
    ]);
    await Promise.all([
        db
            .insert(boardPermissions)
            .values({ boardId: board1[0].id, userId: user2[0].id, canView: true, canEdit: false })
            .onConflictDoNothing({ target: [boardPermissions.boardId, boardPermissions.userId] }),
        db
            .insert(boardPermissions)
            .values({ boardId: board2[0].id, userId: user1[0].id, canView: true, canEdit: true })
            .onConflictDoNothing({ target: [boardPermissions.boardId, boardPermissions.userId] }),
    ]);

    console.log("7/15 - Seeding board events...");
    const json1 = JSON.parse(board1eventsJson) as any[];
    const json2 = JSON.parse(board2eventsJson) as any[];
    // Seed board events
    await Promise.all([
        db.delete(boardEvents).where(eq(boardEvents.boardId, board1[0].id)),
        db.delete(boardEvents).where(eq(boardEvents.boardId, board2[0].id)),
    ]);
    await Promise.all([
        db.insert(boardEvents).values(
            json1.map((json) => ({
                boardId: board1[0].id,
                logId: json?.order || 0,
                eventId: `${user1[0].id}:${json?.order || 0}`,
                eventBody: json.body,
            }))
        ),
        db.insert(boardEvents).values(
            json2.map((json) => ({
                boardId: board2[0].id,
                logId: json?.order || 0,
                eventId: `${user2[0].id}:${json?.order || 0}`,
                eventBody: json.body,
            }))
        ),
    ]);

    console.log("8/15 - Seeding board snapshots...");
    // Seed board snapshots
    await Promise.all([
        db.delete(boardSnapshots).where(eq(boardSnapshots.boardUUID, BOARD_UUID1)),
        db.delete(boardSnapshots).where(eq(boardSnapshots.boardUUID, BOARD_UUID2)),
    ]);
    await Promise.all([
        db.insert(boardSnapshots).values({
            boardUUID: board1[0].boardUUID,
            snapshot: snapshot1,
            lastEventOrder: 1,
        }),
        db.insert(boardSnapshots).values({
            boardUUID: board2[0].boardUUID,
            snapshot: snapshot2,
            lastEventOrder: 1,
        }),
    ]);

    console.log("9/15 - Seeding board links...");
    // Seed board edit links
    await Promise.all([
        db.delete(boardEditLink).where(eq(boardEditLink.boardId, board1[0].id)),
        db.delete(boardEditLink).where(eq(boardEditLink.boardId, board2[0].id)),
    ]);
    await Promise.all([
        db.insert(boardEditLink).values({
            boardId: board1[0].id,
            editLinkUUID: EDIT_LINK_UUID1,
        }),
        db.insert(boardEditLink).values({
            boardId: board2[0].id,
            editLinkUUID: EDIT_LINK_UUID2,
        }),
    ]);

    console.log("10/15 - Seeding board links...");
    // Seed board view links
    await Promise.all([
        db.delete(boardViewLink).where(eq(boardViewLink.boardId, board1[0].id)),
        db.delete(boardViewLink).where(eq(boardViewLink.boardId, board2[0].id)),
    ]);
    await Promise.all([
        db.insert(boardViewLink).values({
            boardId: board1[0].id,
            viewLinkUUID: VIEW_LINK_UUID1,
        }),
        db.insert(boardViewLink).values({
            boardId: board2[0].id,
            viewLinkUUID: VIEW_LINK_UUID2,
        }),
    ]);

    console.log("11/15 - Seeding user links...");
    // Seed user edit links
    await Promise.all([
        db.delete(userEditLink).where(eq(userEditLink.userId, user1[0].id)),
        db.delete(userEditLink).where(eq(userEditLink.userId, user2[0].id)),
    ]);
    await Promise.all([
        db.insert(userEditLink).values({
            userId: user1[0].id,
            editLinkUUID: USER_EDIT_LINK_UUID1,
        }),
        db.insert(userEditLink).values({
            userId: user2[0].id,
            editLinkUUID: USER_EDIT_LINK_UUID2,
        }),
    ]);

    console.log("12/15 - Seeding user links...");
    // Seed user view links
    await Promise.all([
        db.delete(userViewLink).where(eq(userViewLink.userId, user1[0].id)),
        db.delete(userViewLink).where(eq(userViewLink.userId, user2[0].id)),
    ]);
    await Promise.all([
        db.insert(userViewLink).values({
            userId: user1[0].id,
            viewLinkUUID: USER_VIEW_LINK_UUID1,
        }),
        db.insert(userViewLink).values({
            userId: user2[0].id,
            viewLinkUUID: USER_VIEW_LINK_UUID2,
        }),
    ]);

    console.log("13/15 - Seeding user passcodes...");
    // Seed user passcodes
    await Promise.all([
        db.delete(userPasscodes).where(eq(userPasscodes.userId, user1[0].id)),
        db.delete(userPasscodes).where(eq(userPasscodes.userId, user2[0].id)),
    ]);
    await Promise.all([
        db.insert(userPasscodes).values({
            userId: user1[0].id,
            passcode: USER_PASSCODE,
            remainingAttempts: 5,
        }),
        db.insert(userPasscodes).values({
            userId: user2[0].id,
            passcode: USER_PASSCODE,
            remainingAttempts: 5,
        }),
    ]);

    console.log("14/15 - Seeding user password reset requests...");
    // Seed user password reset requests
    await Promise.all([
        db
            .delete(userPasswordResetRequests)
            .where(
                and(
                    eq(userPasswordResetRequests.userId, user1[0].id),
                    eq(userPasswordResetRequests.token, RESET_TOKEN1)
                )
            ),
        db
            .delete(userPasswordResetRequests)
            .where(
                and(
                    eq(userPasswordResetRequests.userId, user2[0].id),
                    eq(userPasswordResetRequests.token, RESET_TOKEN2)
                )
            ),
    ]);
    await Promise.all([
        db.insert(userPasswordResetRequests).values({
            userId: user1[0].id,
            token: RESET_TOKEN1,
            expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        }),
        db.insert(userPasswordResetRequests).values({
            userId: user2[0].id,
            token: RESET_TOKEN2,
            expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        }),
    ]);

    console.log("15/15 - Database seeding completed.");

    process.exit(0);
}

index().catch(console.error);
