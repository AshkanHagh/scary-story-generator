import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { FastifyReply } from "fastify";
import { ZodValidationException } from "nestjs-zod";
import { ZodError } from "zod";
import { StoryErrorType } from "./exception";

@Catch(ZodValidationExceptionFilter)
export class ZodValidationExceptionFilter implements ExceptionFilter {
  private logger = new Logger(ZodValidationExceptionFilter.name);

  catch(exception: ZodValidationException, host: ArgumentsHost) {
    const reply = host.switchToHttp().getResponse<FastifyReply>();

    const statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
    const error = (exception.getZodError() as ZodError).issues.map((issue) => ({
      field: issue.path.join(","),
      message: issue.message,
      code: issue.code,
    }));
    this.logger.error({
      type: "zod-validation",
      ...error,
    });

    reply.status(statusCode).send({
      statusCode: statusCode.toString(),
      message: StoryErrorType.INVALID_PAYLOAD,
    });
  }
}
