import { Module } from "@nestjs/common";
import { DATABASE } from "./constant";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { ConfigService } from "@nestjs/config";
import { IDbConfig } from "src/configs/db.config";

@Module({
  providers: [
    {
      provide: DATABASE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbConfig = config.get<IDbConfig>("db");

        const pool = new Pool({
          connectionString: dbConfig?.postgres.url,
          max: 5,
          ssl: process.env.NODE_ENV === "production",
        });

        return drizzle(pool, { schema, casing: "snake_case" });
      },
    },
  ],
  exports: [DATABASE],
})
export class DrizzleModule {}
