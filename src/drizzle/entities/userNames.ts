import { pgTable, varchar, integer } from 'drizzle-orm/pg-core';
import { users } from './users';

export const userNames = pgTable('user_name', {
	userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 100 }),
});