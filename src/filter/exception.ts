import { HttpException, HttpStatus } from "@nestjs/common";

export enum StoryErrorType {
  InternalServerError = "INTERNAL_SERVER_ERROR",
}

export class StoryError extends HttpException {
  constructor(
    public errorType: StoryErrorType,
    cause: unknown,
  ) {
    super(errorType, StoryError.getStatusCode(errorType), {
      cause,
    });
  }

  static getStatusCode(type: StoryErrorType) {
    switch (type) {
      default: {
        return HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }
  }
}
