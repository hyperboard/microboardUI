import { boolean, integer, pgEnum, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { enumToPgEnum } from "shared/lib/enumToPgEnum";
import { users } from "./users";

export enum DirectAccessType {
    VIEW = "view",
    EDIT = "edit",
}

export const directAccessTypes = pgEnum("direct_access_type", enumToPgEnum(DirectAccessType));

export const boards = pgTable("boards", {
    id: serial("id").primaryKey(),
    createdAt: timestamp("created").defaultNow(),
    title: text("boardname").default(""),
    uniqId: uuid("uniq_id").defaultRandom().notNull().unique(),
    authorUUID: uuid("author_key"),
    isPublic: boolean("is_public").default(false).notNull(),
    directAccessType: directAccessTypes("direct_access_type").notNull().default(DirectAccessType.EDIT),
});

export const userBoardId = pgTable("user_board_id", {
    userId: integer("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    boardUuid: uuid("board_uuid"),
});
