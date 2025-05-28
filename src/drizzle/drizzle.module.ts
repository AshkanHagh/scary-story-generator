import { Module } from "@nestjs/common";
import { DATABASE } from "./constant";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory() {
        const url = process.env.DATABASE_URL;

        const pool = new Pool({
          connectionString: url,
          max: 10,
          ssl: process.env.NODE_ENV === "production",
        });

        return drizzle(pool, { schema, casing: "snake_case" });
      },
    },
  ],
  exports: [DATABASE],
})
export class DrizzleModule {}
