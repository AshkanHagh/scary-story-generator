import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { FastifyReply } from "fastify";
import { ZodValidationException } from "nestjs-zod";
import { StoryErrorType } from "./exception";
import { FastifyRequest } from "fastify";
import { captureException } from "@sentry/nestjs";

@Catch(ZodValidationExceptionFilter)
export class ZodValidationExceptionFilter implements ExceptionFilter {
  private logger = new Logger(ZodValidationExceptionFilter.name);

  catch(exception: ZodValidationException, host: ArgumentsHost) {
    const reply = host.switchToHttp().getResponse<FastifyReply>();
    const req = host.switchToHttp().getRequest<FastifyRequest>();

    const statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
    const baseLogForamt = `method=${req.method} url=${req.url} status_code=${statusCode}`;
    const isProd = process.env.NODE_ENV === "production";
    if (isProd) {
      captureException(exception);
      this.logger.error(`${baseLogForamt} error=${exception.message}`);
    } else {
      this.logger.error({ err: exception }, baseLogForamt);
    }

    reply.status(statusCode).send({
      statusCode: statusCode.toString(),
      message: StoryErrorType.INVALID_PAYLOAD,
    });
  }
}
