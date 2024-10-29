import { pgTable, varchar, integer } from 'drizzle-orm/pg-core';
import { users } from './users';

export const userPasswords = pgTable('user_password', {
	userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
	password: varchar('password', { length: 100 }),
});