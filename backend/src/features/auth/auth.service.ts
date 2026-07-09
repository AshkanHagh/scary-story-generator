import { Injectable } from "@nestjs/common";
import { InjectDatabase } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { JwtService } from "@nestjs/jwt";
import { UserTable } from "src/drizzle/schemas";

@Injectable()
export class AuthService {
  constructor(
    @InjectDatabase() private db: Database,
    private jwtService: JwtService,
  ) {}

  async anonymousAuth() {
    const [user] = await this.db.insert(UserTable).values({}).$returningId();
    return await this.jwtService.signAsync({ id: user.id });
  }
}
