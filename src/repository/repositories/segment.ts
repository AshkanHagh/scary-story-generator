import { Inject, Injectable } from "@nestjs/common";
import { ISegmentRepository } from "../interfaces/repository";
import { DATABASE } from "src/drizzle/constant";
import { Database } from "src/drizzle/types";
import { ISegmentInsertForm, ISegment, SegmentTable } from "src/drizzle/schema";
import { eq } from "drizzle-orm";

@Injectable()
export class SegmentRepository implements ISegmentRepository {
  constructor(@Inject(DATABASE) private db: Database) {}

  async insert(form: ISegmentInsertForm): Promise<ISegment> {
    const [segment] = await this.db
      .insert(SegmentTable)
      .values(form)
      .returning();

    return segment;
  }

  async update(id: string, form: Partial<ISegmentInsertForm>): Promise<void> {
    await this.db.update(SegmentTable).set(form).where(eq(SegmentTable.id, id));
  }
}
