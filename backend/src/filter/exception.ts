import { HttpException, HttpStatus } from "@nestjs/common";

export enum StoryErrorType {
  InvalidToken = "INVALID_TOKEN",
  Unauthorized = "UNAUTHORIZED",
  InvalidBodyField = "INVALID_BODY_FIELD",
  NotFound = "NOT_FOUND",
  HasNoPermission = "HAS_NO_PERMISSION",
  S3ReqFailed = "S3_REQUEST_FAILED",
  Timeout = "TIMEOUT",
  NotCompleted = "NOT_COMPLETED",
  ImageGenerationFailed = "IMAGE_GENERATION_FAILED",
  AudioGenerationFailed = "AUDIO_GENERATION_FAILED",
  AssetsDownloadFailed = "ASSETS_DOWNLOAD_FAIELD",
  FrameGenerationFailed = "FRAME_GENERATION_FAILED",
  VideoGenerationFailed = "VIDEO_GENERATION_FAILED",
  ContextGenerationFailed = "CONTEXT_GENERATION_FAILED",
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
