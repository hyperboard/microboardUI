import { pgTable, uuid, integer, pgEnum, serial } from 'drizzle-orm/pg-core';
import { boards } from './boards';
import { enumToPgEnum } from 'shared/lib/enumToPgEnum';

export enum AccessKeyType {
	VIEW = 'view',
	EDIT = 'edit',
}

export const linkTypesEnum = pgEnum('access_key_type', enumToPgEnum(AccessKeyType))

export const boardAccessKeys = pgTable('access_keys', {
	id: serial('id').primaryKey(),
	boardId: integer('board_id').references(() => boards.id, { onDelete: 'cascade' }).notNull(),
	keyUUID: uuid('key_uuid').notNull().defaultRandom().unique(),
	keyType: linkTypesEnum('key_type').notNull().default(AccessKeyType.VIEW),
});
