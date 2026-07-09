import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { StoryErrorType, StoryError } from "./exception";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException | StoryError | Error, host: ArgumentsHost) {
    const reply = host.switchToHttp().getResponse<FastifyReply>();
    const req = host.switchToHttp().getRequest<FastifyRequest>();

    this.logger.error({
      type: "http",
      url: req.url,
      method: req.method,
      name: exception.name,
      message: exception.message,
      cause: exception.cause,
    });

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let resMessage: string;
    if (exception instanceof StoryError) {
      resMessage = exception.type;
    } else {
      const allowedStatusCode = [HttpStatus.NOT_FOUND];
      // internal server error for all none lina error
      // only some status codes must have thir own error message
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
