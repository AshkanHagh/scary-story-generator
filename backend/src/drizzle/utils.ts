import { timestamp, int } from "drizzle-orm/mysql-core";

export const id = int().autoincrement().primaryKey();
export const createdAt = timestamp().notNull().defaultNow();
export const updatedAt = timestamp().notNull().defaultNow().onUpdateNow();
