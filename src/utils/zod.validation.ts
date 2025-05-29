import { ArgumentMetadata, PipeTransform } from "@nestjs/common";
import { StoryError, StoryErrorType } from "src/filter/exception";
import { ZodSchema } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: unknown, _metadata: ArgumentMetadata) {
    const parsedValue = this.schema.safeParse(value);
    if (!parsedValue.success) {
      throw new StoryError(StoryErrorType.InvalidBodyField, parsedValue.error);
    }

    return parsedValue.data as unknown;
  }
}
