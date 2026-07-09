import * as schema from "./schemas";
import { MySql2Database } from "drizzle-orm/mysql2";
import { Pool } from "mysql2/promise";

export type Database = MySql2Database<typeof schema> & {
  $client: Pool;
};
