import { HttpException, HttpStatus } from "@nestjs/common";

export enum StoryErrorType {
  InternalServerError = "INTERNAL_SERVER_ERROR",
  InvalidToken = "INVALID_TOKEN",
  Unauthorized = "UNAUTHORIZED",
}

export class StoryError extends HttpException {
  constructor(
    public errorType: StoryErrorType,
    cause?: unknown,
  ) {
    super(errorType, StoryError.getStatusCode(errorType), {
      cause,
    });
  }

  static getStatusCode(type: StoryErrorType) {
    switch (type) {
      case StoryErrorType.InvalidToken || StoryErrorType.Unauthorized: {
        return HttpStatus.UNAUTHORIZED;
      }
      default: {
        return HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }
  }
}
