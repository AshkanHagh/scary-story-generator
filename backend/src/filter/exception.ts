import { HttpException, HttpStatus } from "@nestjs/common";

export enum StoryErrorType {
  InternalServerError = "INTERNAL_SERVER_ERROR",
  InvalidToken = "INVALID_TOKEN",
  Unauthorized = "UNAUTHORIZED",
  FailedToGenerateStory = "FAILED_TO_GENERATE_STORY",
  FailedToGenerateSegment = "FAILED_TO_GENERATE_SEGMENT",
  FailedToGenerateImage = "FAILED_TO_GENERATE_IMAGE",
  FailedToGenerateVideo = "FAILED_TO_GENERATE_VIDEO",
  InvalidBodyField = "INVALID_BODY_FIELD",
  LlmAgentFailed = "LLM_AGENT_FAILED",
  NotFound = "NOT_FOUND",
  HasNoPermission = "HAS_NO_PERMISSION",
  S3ReqFailed = "S3_REQUEST_FAILED",
  Timeout = "TIMEOUT",
  NotCompleted = "NOT_COMPLETED",
  ImageGenerationFailed = "IMAGE_GENERATION_FAILED",
  AudioGenerationFailed = "AUDIO_GENERATION_FAILED",
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
