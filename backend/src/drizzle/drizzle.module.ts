import { Global, Module } from "@nestjs/common";
import { DrizzleService } from "./drizzle.service";
import { DATABASE } from "./constants";
import { drizzle } from "drizzle-orm/mysql2";
import * as schemas from "./schemas";
import { Database } from "./types";

@Global()
@Module({
  providers: [
    DrizzleService,
    {
      provide: DATABASE,
      inject: [DrizzleService],
      useFactory: (drizzleService: DrizzleService): Database => {
        return drizzle(drizzleService.pool, {
          mode: "default",
          schema: schemas,
          casing: "snake_case",
        });
      },
    },
  ],
  exports: [DATABASE],
})
export class DrizzleModule {}
