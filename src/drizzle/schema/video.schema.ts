import { pgTable } from "drizzle-orm/pg-core";

export const VideoTable = pgTable("videos", (table) => {
  return {
    id: table.uuid().primaryKey().defaultRandom(),
  };
});
