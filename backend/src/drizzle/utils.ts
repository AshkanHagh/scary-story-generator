import { timestamp, varchar } from "drizzle-orm/mysql-core";
import { randomUUID } from "node:crypto";

export const id = varchar({ length: 128 })
  .primaryKey()
  .$defaultFn(() => randomUUID());
export const createdAt = timestamp().notNull().defaultNow();
export const updatedAt = timestamp().notNull().defaultNow().onUpdateNow();
