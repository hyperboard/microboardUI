import { pgTable, boolean, integer, primaryKey, } from 'drizzle-orm/pg-core';
import { boards } from './boards';
import { users } from './users';

export const boardPermissions = pgTable('board_permissions', {
	boardId: integer('board_id').references(() => boards.id, { onDelete: 'cascade' }).notNull(),
	userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
	canView: boolean('can_view').default(false),
	canEdit: boolean('can_edit').default(false),
}, (t) => ({
	pk: primaryKey({ columns: [t.boardId, t.userId] }),
}));