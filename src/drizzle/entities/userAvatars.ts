import { pgTable, varchar, integer, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';

export const userAvatars = pgTable('user_avatars', {
	userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).unique(),
	avatar: varchar('avatar'),
	generated: boolean('generated').default(true).notNull(),
});