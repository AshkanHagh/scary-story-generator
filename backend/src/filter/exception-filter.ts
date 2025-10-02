import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { StoryError } from "./exception";
import { Request, Response } from "express";

@Catch(HttpException)
export class StoryExceptionFilter implements ExceptionFilter {
  catch(exception: StoryError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();

    console.error("ERROR:", {
      errorType: exception.errorType,
      originalError: exception.cause,
      statusCode,
      path: req.url,
    });

    res.status(statusCode).json({
      statusCode: `${statusCode} ${HttpStatus[statusCode]}`,
      message: exception.errorType,
    });
  }
}
