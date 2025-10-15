# Scary Story Generator Backend

A REST API backend that transforms user-submitted scary story scripts into AI-generated videos with images, voiceovers, and subtitles, built with NestJS, TypeScript, and BullMQ.

## Introduction

The Scary Story Generator Backend is a scalable REST API that processes user-submitted scary story scripts into AI-generated videos. It leverages NestJS for a robust server framework, BullMQ for asynchronous task management, and integrates with AI services (OpenAI for text-to-speech, Replicate for image generation) and AWS S3 for storage. The system uses a queue-driven architecture to handle computationally intensive tasks like image generation, audio synthesis, and video assembly.

## Key Features

- **Story Processing**: Accepts scary story scripts, generates context, and splits them into segments for AI asset creation.
- **AI-Generated Assets**: Uses Replicate’s Flux.1 for segment images and OpenAI for voiceovers, storing in AWS S3.
- **Video Assembly**: Downloads assets, generates dynamic frames (via worker threads), creates segment videos with FFmpeg (including subtitles), and concatenates into a final video.
- **Queue System**: BullMQ with Redis for processing across Story, Image, Video, and Flow queues, using FlowProducer for dependency management.
- **Authentication**: JWT-based anonymous authentication for secure access.
- **Status Polling**: Supports polling for segment and video generation progress.
- **Temporary File Management**: Handles disk-based processing with automatic cleanup using temporary directories.

## Tech Stack

- **Backend**: Node.js, NestJS, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Queue System**: BullMQ (Redis-based), including FlowProducer for job flows
- **AI Services**:
  - OpenAI (text-to-speech for voiceovers)
  - Replicate (Flux.1 for image generation)
- **File Processing**:
  - FFmpeg (video generation with subtitles)
  - Sharp (image optimization to WebP)
  - Piscina (worker threads for parallel frame generation)
  - @napi-rs/canvas (frame rendering in workers)
  - srt-parser-2 (subtitle timing from audio)
- **Storage**: AWS S3 (@aws-sdk/client-s3)
- **Other**: tmp-promise (temporary directories), zod (validation), jsonwebtoken (JWT), fluent-ffmpeg (FFmpeg wrapper)

## Why This Project?

This backend demonstrates expertise in scalable, AI-integrated applications with asynchronous processing. It highlights NestJS for structure, BullMQ for task orchestration, and efficient handling of video pipelines, addressing challenges like AI asset generation, frame rendering, and cloud storage.

## Queue-Driven Architecture

BullMQ manages tasks across queues, with Story queue handling initial processing and Video flow (via FlowProducer) orchestrating asset downloads, frames, and assembly. Dependencies ensure ordered execution (e.g., download before frames).

- **Story Queue (`WorkerEvents.Story`)**:
  - **Purpose**: Generates story context, splits into segments, and creates AI assets (images/voice).
  - **Jobs**:
    - `story.generate.context`: Uses OpenAI to generate context, inserts segments, and queues bulk image/voice jobs.
    - `story.generate.segment.image`: Generates image prompt from context, calls Replicate (or mock), resizes with Sharp, uploads to S3, marks segment completed.
    - `story.generate.segment.voice`: Generates audio with OpenAI, uploads to S3, updates segment.
  - **Flow**: User triggers segmentation → context job → bulk segment jobs for images/voices (parallel, images mark completion).

- **Image Queue (`WorkerEvents.Image`)**:
  - **Purpose**: Downloads S3 assets to temp dirs for video processing.
  - **Jobs**:
    - `image.download.assets`: Fetches image/audio buffers from S3 and writes to disk.
  - **Flow**: Triggered as child of frame jobs in video flow.

- **Video Queue (`WorkerEvents.Video`)**:
  - **Purpose**: Frame generation, segment videos, and final concatenation.
  - **Jobs**:
    - `video.generate.segment.frame`: Downloads word timestamps, generates SRT subtitles, uses Piscina to parallel-generate frames (via frame-worker.js with Canvas).
    - `video.generate.video`: FFmpeg combines frames (framerate input), audio, and subtitles (burned-in via vf filter) into MP4 segment.
    - `video.combine.videos`: Sorts/concatenates segments (via FFmpeg concat), uploads final MP4 to S3, updates status.
  - **Flow**: Video generation uses FlowProducer: COMBINE_VIDEOS (root) → per-segment GENERATE_VIDEO → GENERATE_SEGMENT_FRAME → DOWNLOAD_ASSETS (Image queue). TmpDirService manages shared temp dirs across jobs for cleanup.

**Queue Relationships**:
- Story queue completes segments (assets in S3) before video flow starts.
- Video flow uses Image queue for downloads, then processes in Video queue.
- FlowProducer enforces dependencies; errors propagate with DB status updates and temp cleanup.
- Concurrency: 4 per worker; Piscina uses all CPU cores for frames.

This decouples phases (assets vs. video), scales heavy tasks, and handles failures via job events (active/completed/failed logging).

## Getting Started

### Installation

1. Copy `.env.example` to `.env` and fill in required values (e.g., database URL, Redis URL, AWS credentials, API keys, JWT secret).

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start docker containers:
   ```bash
   docker-compose up -d
   ```

4. Generate and run database migrations:
   ```bash
   pnpm run db:generate
   pnpm run db:migrate
   ```

5. Start the application:
   ```bash
   pnpm run start:dev
   ```

## Challenges and Learnings

- **Flow Orchestration**: Utilized BullMQ FlowProducer for video pipelines, ensuring assets are ready before frame/video jobs.
- **Asset Generation**: Integrated Replicate/OpenAI with S3 uploads; handled production vs. mock modes.
- **Frame & Video Sync**: Piscina for parallel frame rendering (dynamic from static images), FFmpeg for audio/subtitle integration and concatenation.
- **Resource Management**: TmpDirService for temp dirs across job flows; error cleanup prevents disk leaks.
- **Polling & Status**: Implemented efficient polling with max wait times for user feedback.

## Future Improvements

- **Retry Logic**: Add BullMQ retries for AI/FFmpeg failures.
- **Multi-Format Videos**: Support aspect ratios like 9:16 via configurable prompts/FFmpeg.
- **Advanced Auth**: OAuth or user accounts beyond anonymous JWT.
- **Subscriptions**: Stripe integration for limits/features.
- **Logging/Monitoring**: Structured logs (e.g., Pino) and metrics for jobs.
- **Horror Specialization**: Optimize prompts/context for scary themes.
