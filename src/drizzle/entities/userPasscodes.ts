import { pgTable, serial, varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const userPasscodes = pgTable('user_passcode', {
	id: serial('id').primaryKey(),
	userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
	passcode: varchar('passcode', { length: 10 }),
	created: timestamp('created').defaultNow(),
	remainingAttempts: integer('remaining_attempts').default(5).notNull(),
});