import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { FastifyReply } from "fastify";
import { StoryErrorType, StoryError } from "./exception";
import { captureException } from "@sentry/nestjs";
import { FastifyRequest } from "fastify";

// captures all the erros thrown in nestjs, use custome erorr type or stauts code msg(default is internal)
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException | StoryError | Error, host: ArgumentsHost) {
    const reply = host.switchToHttp().getResponse<FastifyReply>();
    const req = host.switchToHttp().getRequest<FastifyRequest>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const baseLogForamt = `method=${req.method} url=${req.url} status_code=${statusCode}`;
    const isProd = process.env.NODE_ENV === "production";
    if (isProd) {
      captureException(exception);
      this.logger.error(`${baseLogForamt} error=${exception.message}`);
    } else {
      this.logger.error({ err: exception }, baseLogForamt);
    }

    let resMessage: string;
    if (exception instanceof StoryError) {
      // exteracting the error type to send in res
      resMessage = exception.type;
    } else {
      // allowing some status codes to use there own message,
      // by default we use internal server error
      const allowedStatusCode = [HttpStatus.NOT_FOUND];
      resMessage = allowedStatusCode.includes(statusCode)
        ? HttpStatus[statusCode]
        : StoryErrorType.INTERNAL_SERVER_ERROR;
    }

    reply.status(statusCode).send({
      message: resMessage,
      statusCode: statusCode.toString(),
    });
  }
}
