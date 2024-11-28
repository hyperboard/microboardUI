import { pgTable, varchar, integer } from 'drizzle-orm/pg-core';
import { users } from './users';

export const userAvatars = pgTable('user_avatars', {
	userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).unique(),
	avatar: varchar('avatar'),
});