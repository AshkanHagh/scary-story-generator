import { HttpException, HttpStatus } from "@nestjs/common";

export enum StoryErrorType {
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_PAYLOAD = "INVALID_PAYLOAD",
  NOT_FOUND = "NOT_FOUND",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  S3_REQ_FAILED = "S3_REQ_FAILED",
  AI_REQ_FAILED = "AI_REQ_FAILED",
  REQ_ALREADY_PROCESSED = "REQ_ALREADY_PROCESSED",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

export class StoryError extends HttpException {
  constructor(
    public type: StoryErrorType,
    cause?: unknown,
  ) {
    // set default status code 500 for not handeled errors
    super(type, HttpStatus.INTERNAL_SERVER_ERROR, {
      cause,
    });
  }

  getStatus(): number {
    switch (this.type) {
      case StoryErrorType.INVALID_PAYLOAD: {
        return HttpStatus.UNPROCESSABLE_ENTITY;
      }
      case StoryErrorType.NOT_FOUND: {
        return HttpStatus.NOT_FOUND;
      }
      case StoryErrorType.PERMISSION_DENIED: {
        return HttpStatus.FORBIDDEN;
      }
      case StoryErrorType.UNAUTHORIZED: {
        return HttpStatus.UNAUTHORIZED;
      }
      default: {
        return HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }
  }
}
