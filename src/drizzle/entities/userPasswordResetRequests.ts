import { pgTable, varchar, integer, serial, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const userPasswordResetRequests = pgTable('password_reset_requests', {
	id: serial('id').primaryKey(),
	userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
	token: varchar('token', { length: 100 }).unique(),
	expirationTime: timestamp('expiration_time'),
});