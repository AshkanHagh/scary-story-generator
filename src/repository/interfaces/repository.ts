import { IUser, IUserInsertForm } from "src/drizzle/schema";

export interface IUserRepository {
  insert(form: IUserInsertForm): Promise<IUser>;
  update(id: string, form: Partial<IUserInsertForm>): Promise<void>;
  find(id: string): Promise<IUser | null>;
}
