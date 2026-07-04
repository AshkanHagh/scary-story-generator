# Scary Story Generator Backend

Takes a user-submitted scary story script and turns it into a finished video — AI-generated images per segment, voiceover, burned-in subtitles, all assembled into one MP4. Built on NestJS with BullMQ handling the async pipeline underneath.

## What it does

The whole thing runs on a queue-driven architecture because generating a video from a script is a genuinely heavy, multi-step job. A script comes in, gets split into segments, and each segment gets its own image (Replicate's Flux.1) and voiceover (OpenAI TTS), both landing in S3. Once assets exist, a separate video flow downloads them, renders subtitle-burned frames across worker threads, stitches each segment into a clip with FFmpeg, then concatenates everything into the final video. Auth is anonymous JWT — no accounts, just a token to keep access controlled — and clients poll for segment/video progress as jobs complete. Temp files live in per-job scratch directories that get cleaned up automatically, success or failure.

## Tech Stack

NestJS + TypeScript on Node, PostgreSQL via Drizzle ORM, BullMQ on Redis (including FlowProducer for job dependency graphs). AI: OpenAI for voice, Replicate for images. Media: FFmpeg for video/subtitles, Sharp for WebP optimization, Piscina + @napi-rs/canvas for parallel frame rendering, srt-parser-2 for subtitle timing. Storage: AWS S3. Also: zod for validation, tmp-promise for scratch dirs, jsonwebtoken for auth.

## Queue architecture

Three queues, dependency-chained through FlowProducer so nothing runs before its inputs exist:

**Story queue** generates context from the script, splits it into segments, then fans out image/voice jobs per segment. `story.generate.segment.image` prompts Replicate, resizes with Sharp, uploads to S3; `story.generate.segment.voice` does the same via OpenAI for audio. Segments get marked complete as their assets land.

**Image queue** just pulls the finished S3 assets back down to disk — triggered as a child job once the video flow needs them.

**Video queue** does the assembly: `video.generate.segment.frame` pulls word timestamps, builds SRT subtitles, and farms frame rendering out to Piscina workers; `video.generate.video` runs FFmpeg to combine frames + audio + burned-in subtitles into a segment MP4; `video.combine.videos` concatenates all segments in order and uploads the final file.

The flow tree is rooted at `COMBINE_VIDEOS`, branching down through per-segment `GENERATE_VIDEO` → `GENERATE_SEGMENT_FRAME` → `DOWNLOAD_ASSETS`, so a segment's video can't start rendering before its frames exist, and combine can't run before every segment is done. Story assets have to be fully in S3 before the video flow even starts. Workers run at concurrency 4; Piscina grabs all available cores for frame rendering. Failures propagate up with DB status updates and temp-dir cleanup at every level.

## Getting started

```bash
cp .env.example .env   # fill in DB, Redis, AWS creds, API keys, JWT secret
pnpm install
docker-compose up -d
pnpm run db:generate
pnpm run db:migrate
pnpm run start:dev
```

## What's next

- Retries for AI/FFmpeg failures (currently a hard fail)
- 9:16 and other aspect ratios, configurable through prompts/FFmpeg
- Real auth beyond anonymous JWT
- Stripe for usage limits / subscriptions
- Tuning prompts specifically for horror rather than generic story generation
