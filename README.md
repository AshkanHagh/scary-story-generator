# Scary Story Generator

A web application that transforms user-written scary stories into AI-generated videos with images, voiceovers, and subtitles.

## Introduction

The Scary Story Generator is a full-stack web application that enables users to input a scary story script and generate a video with AI-generated visuals, voice narration, and subtitles. Built with a queue-driven architecture, it leverages AI services like OpenAI and Replicate to create engaging multimedia content, showcasing advanced backend processing and scalable design.

## Key Features

- **Story Input**: Users submit a scary story script, which is split into segments for processing.
- **AI-Generated Assets**: Generates images (via Replicate’s Flux.1 model) and voiceovers (via OpenAI) for each story segment.
- **Video Creation**: Combines images, audio, and subtitles into a cohesive video using FFmpeg.
- **Queue-Driven Processing**: Uses BullMQ for asynchronous task management, ensuring scalability and reliability.
- **Secure Authentication**: Simple JWT-based anonymous authentication for user access.
- **Cloud Storage**: Stores generated assets and videos in AWS S3.

## Tech Stack

- **Backend**: Node.js, NestJS, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Queue System**: BullMQ (Redis-based)
- **AI Services**:
  - OpenAI (text-to-speech for voiceovers)
  - Replicate (Flux.1 model for image generation)
- **File Processing**: FFmpeg (video generation), Sharp (image processing), Piscina (Node.js worker threads)
- **Storage**: AWS S3
- **Containerization**: Docker
- **Other**: Canvas (image frame generation), UUID (unique identifiers)

## Why I Built This

I developed the Scary Story Generator to explore the integration of AI-driven content creation with a scalable, queue-driven architecture. The project allowed me to deepen my expertise in NestJS, TypeScript, and asynchronous processing with BullMQ, while tackling real-world challenges like video generation and cloud storage. It demonstrates my ability to build complex, user-focused applications with modern technologies.

## Queue-Driven Architecture

The project uses BullMQ to manage asynchronous tasks across three queues, ensuring efficient processing of computationally intensive tasks like image and video generation. Below is how the queues interact:

- **Story Queue (**`WorkerEvents.Story`**)**:

  - **Purpose**: Handles story processing, including generating context, splitting scripts into segments, and triggering image/voice generation.
  - **Jobs**:
    - `GENERATE_IMAGE_CONTEXT`: Generates story context using OpenAI and creates segments.
    - `GENERATE_SEGMENT_IMAGE_REPLICATE`: Generates image prompts and queues image generation.
    - `GENERATE_SEGMENT_VOICE`: Generates voiceovers for segments using OpenAI.
  - **Flow**:
    - A user submits a story → `GENERATE_IMAGE_CONTEXT` splits the script into segments and queues `GENERATE_SEGMENT_IMAGE_REPLICATE` and `GENERATE_SEGMENT_VOICE` for each segment.

- **Image Queue (**`WorkerEvents.Image`**)**:

  - **Purpose**: Manages image generation and frame creation for videos.
  - **Jobs**:
    - `GENERATE_IMAGE`: Uses Replicate’s Flux.1 to generate images for segments.
    - `DOWNLOAD_AND_GENERATE_SEGMENT_FRAME`: Downloads segment assets (image, voice) and generates video frames using Piscina and Canvas.
  - **Flow**:
    - `GENERATE_SEGMENT_IMAGE_REPLICATE` (Story Queue) triggers `GENERATE_IMAGE` → Generated images are stored in S3 → `DOWNLOAD_AND_GENERATE_SEGMENT_FRAME` downloads assets and queues video frame generation.

- **Video Queue (**`WorkerEvents.Video`**)**:

  - **Purpose**: Handles video segment creation and final video assembly.
  - **Jobs**:
    - `GENERATE_SEGMENT_VIDEO`: Combines frames, audio, and subtitles into segment videos using FFmpeg.
    - `COMBINE_SEGMENT_VIDEOS`: Concatenates segment videos into a final video and uploads it to S3.
  - **Flow**:
    - `DOWNLOAD_AND_GENERATE_SEGMENT_FRAME` (Image Queue) triggers `GENERATE_SEGMENT_VIDEO` for each segment → Once all segments are processed, `COMBINE_SEGMENT_VIDEOS` assembles the final video.

**Queue Relationships**:

- The **Story Queue** initiates the process by splitting the story and queuing tasks for image and voice generation.
- The **Image Queue** processes AI-generated assets and prepares frames, passing completed segments to the Video Queue.
- The **Video Queue** finalizes segment videos and combines them, ensuring all dependencies (images, audio, subtitles) are resolved before final output.

This architecture ensures scalability by decoupling tasks and handling failures gracefully with error logging and segment status updates.

## Why These Technologies?

- **NestJS/TypeScript**: Provides a structured, type-safe framework for building scalable backend services.
- **Drizzle ORM/PostgreSQL**: Offers lightweight, type-safe database queries with excellent PostgreSQL support.
- **BullMQ**: Enables asynchronous, queue-driven processing for handling intensive AI and video tasks.
- **OpenAI/Replicate**: Industry-leading AI models for generating high-quality voiceovers and images.
- **AWS S3**: Reliable, scalable storage for assets and videos.
- **FFmpeg/Piscina**: Efficient tools for video processing and parallel frame generation in Node.js.
- **Docker**: Ensures consistent deployment and development environments.

## Getting Started

### Prerequisites

- Node.js (v18+)
- Docker
- Redis (for BullMQ)
- AWS S3 bucket
- API keys for OpenAI and Replicate

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/AshkanHagh/scary-story-generator.git
   cd scary-story-generator
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up the PostgreSQL database and Redis using Docker:

   ```bash
   docker-compose up -d
   ```

4. Run database migrations with Drizzle ORM:

   ```bash
   pnpm run db:generate
   pnpm run db:migrate
   ```

5. Start the application:

   ```bash
   npm run start:dev
   ```

### Running the Application

- Access the API at `http://localhost:7319`.
- Use the `/auth/anonymous` endpoint to generate a JWT token.
- Submit a story via the `/stories` endpoint, then poll `/videos/:videoId/status` to track video generation progress.

## Usage

1. **Authenticate**: Use the anonymous JWT endpoint to get a token.
2. **Submit a Story**: Send a POST request to `/stories` with a title and script.
3. **Generate Video**: Call `/stories/videos/:storyId` to start video generation.
4. **Poll Status**: Use `/stories/videos/:video_id/status` to check progress and retrieve the final video URL from S3.
5. Example flow:
   - Input: A scary story script (e.g., "A shadowy figure moved in the fog...").
   - Output: A video with AI-generated images, voice narration, and subtitles, hosted on S3.

## Challenges and Learnings

- **Queue Management**: Mastered BullMQ to orchestrate complex, interdependent tasks across multiple queues, ensuring fault tolerance and scalability.
- **AI Integration**: Learned to optimize prompts for Replicate’s Flux.1 and OpenAI’s text-to-speech for high-quality outputs.
- **Video Processing**: Overcame challenges in synchronizing audio, subtitles, and frames using FFmpeg, achieving smooth video output.
- **Performance**: Optimized Piscina worker threads to generate thousands of video frames efficiently.

## TODOs (Future Improvements)
- **Retry Mechanism**: Implement retry logic for segment and video generation to handle transient failures in AI services or processing.
- **Multi-Format Video**: Add support for generating both horizontal (16:9) and vertical (9:16) video formats to accommodate different platforms.
- **Enhanced Authentication**: Integrate secure OAuth (e.g., Google, GitHub) and email/password authentication for robust user access.
- **Scalable JWT System**: Refactor JWT authentication to support secure, scalable token management with refresh tokens and revocation.
- **Scary Story Focus**: Refactor the project to specialize in scary story generation, optimizing AI prompts for horror themes and visuals.
- **Stripe Integration**: Add Stripe for monthly subscription payments to enable premium features or higher usage limits.
- **Improved Logging**: Implement structured logging (e.g., using Winston or Pino) to capture detailed job errors and system events for debugging.
