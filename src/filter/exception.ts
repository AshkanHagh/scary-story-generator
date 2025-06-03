import { HttpException, HttpStatus } from "@nestjs/common";

export enum StoryErrorType {
  InternalServerError = "INTERNAL_SERVER_ERROR",
  InvalidToken = "INVALID_TOKEN",
  Unauthorized = "UNAUTHORIZED",
  FailedToGenerateStory = "FAILED_TO_GENERATE_STORY",
  InvalidBodyField = "INVALID_BODY_FIELD",
  LlmAgentFailed = "LLM_AGENT_FAILED",
  NotFound = "NOT_FOUND",
  HasNoPermission = "HAS_NO_PERMISSION",
  FailedToGenerateImage = "FAILED_TO_GENERATE_IMAGE",
  S3ReqFailed = "S3_REQUEST_FAILED",
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
