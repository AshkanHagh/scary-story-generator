import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule as BaseConfigModule } from "@nestjs/config";
import { authConfig } from "./auth.config";

@Module({})
export class ConfigModule {
  static register(): Promise<DynamicModule> {
    return BaseConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [authConfig],
    });
  }
}
