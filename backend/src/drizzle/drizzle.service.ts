import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import mysql from "mysql2/promise";

@Injectable()
export class DrizzleService implements OnModuleDestroy, OnModuleInit {
  private logger = new Logger(DrizzleService.name);
  pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool({
      uri: process.env.DATABASE_URL!,
      connectionLimit: 20,
      maxIdle: 20,
    });
  }

  onModuleInit() {
    this.pool.on("connection", () => {
      this.logger.log("database pool connected");
    });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
