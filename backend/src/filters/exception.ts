import { HttpException, HttpStatus } from "@nestjs/common";

export enum StoryErrorType {
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_PAYLOAD = "INVALID_PAYLOAD",
  NOT_FOUND = "NOT_FOUND",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  NOT_COMPLETED = "NOT_COMPLETED",
  S3_REQ_FAILED = "S3_REQ_FAILED",
  IMAGE_GENERATION_FAILED = "IMAGE_GENERATION_FAILED",
  AUDIO_GENERATION_FAILED = "AUDIO_GENERATION_FAILED",
  ASSETS_DOWNLOAD_FAIELD = "ASSETS_DOWNLOAD_FAIELD",
  FRAME_GENERATION_FAILED = "FRAME_GENERATION_FAILED",
  VIDEO_GENERATION_FAILED = "VIDEO_GENERATION_FAILED",
  CONTEXT_GENERATION_FAILED = "CONTEXT_GENERATION_FAILED",
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
      default: {
        return HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }
  }
}
