import { pgTable, uuid, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

export const userEditLink = pgTable("user_edit_link", {
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    editLinkUUID: uuid("edit_link_uuid"),
});

export const userViewLink = pgTable("user_view_link", {
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    viewLinkUUID: uuid("view_link_uuid"),
});
