import { Inject, Injectable } from "@nestjs/common";
import { DATABASE } from "src/drizzle/constant";
import { Database } from "src/drizzle/types";
import { IUserRepository } from "../interfaces/repository";
import { IUserInsertForm, IUser, UserTable } from "src/drizzle/schema";
import { eq } from "drizzle-orm";

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(@Inject(DATABASE) private db: Database) {}

  async insert(form: IUserInsertForm): Promise<IUser> {
    const [user] = await this.db.insert(UserTable).values(form).returning();
    return user;
  }

  async update(id: string, form: Partial<IUserInsertForm>): Promise<void> {
    await this.db.update(UserTable).set(form).where(eq(UserTable.id, id));
  }

  async find(id: string): Promise<IUser | null> {
    const [user] = await this.db
      .select()
      .from(UserTable)
      .where(eq(UserTable.id, id));

    return user as IUser | null;
  }
}
