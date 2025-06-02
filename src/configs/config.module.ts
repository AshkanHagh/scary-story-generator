import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule as BaseConfigModule } from "@nestjs/config";
import { authConfig } from "./auth.config";
import { aiConfig } from "./ai.config";
import { dbConfig } from "./db.config";
import { awsConfig } from "./aws.config";

@Module({})
export class ConfigModule {
  static register(): Promise<DynamicModule> {
    return BaseConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [authConfig, aiConfig, dbConfig, awsConfig],
    });
  }
}
