# Scary Story Generator Backend

Takes a user-submitted scary story script and turns it into a finished video — AI-generated images per segment, one voiceover and subtitle track for the whole story, assembled into an MP4. Built on NestJS with BullMQ handling the async pipeline underneath.

## What it does

A script gets split into segments, each with its own AI-generated image. Speech and subtitles are generated once for the whole story, and each segment's video length is derived from the total speech duration. Segment videos are built from still images with a zoom/pan effect, and processing stays in memory wherever possible — the only step that touches disk is final concatenation, which needs real files to stitch segments, audio, and subtitles into the finished video. Assets are pulled on demand rather than pre-staged anywhere shared, so jobs don't depend on each other's local state and can scale across workers freely.

Auth is anonymous — no user accounts, just password + JWT, implemented through Passport (local + JWT strategies) to keep access controlled without full user management.

Clients track generation progress by polling — short or long polling, depending on the endpoint — to get realtime status as segments and the final video complete.

Cleanup is automatic on both success and failure: temp directories used during video concatenation get removed regardless of outcome, and anything left in S3 auto-expires after 24 hours, so nothing needs manual pruning.

## Logging & monitoring

In production, requests are logged with a request ID and a lightweight success/error outcome — enough for monitoring, not full detail. Actual errors go to Sentry, and the request ID lets you trace a failure from the logs back to its full Sentry entry. In development, errors are logged directly with full detail instead of going through Sentry.

## Tech Stack

**Framework & API** — NestJS on Fastify, with Helmet and CSRF protection
**Database** — MySQL via Drizzle ORM
**Queues** — BullMQ on Redis
**Auth** — Passport (local + JWT strategies), anonymous sessions
**AI services** — Pollinations SDK (text/image), ElevenLabs (voice), AssemblyAI (subtitles/transcription)
**Media processing** — fluent-ffmpeg, execa
**Logging & monitoring** — Pino (nestjs-pino), Sentry (NestJS + profiling)
**Storage** — AWS S3

## Queue architecture

**Segment queue**
- `SPEACH` — generates the story's full voiceover and subtitles, and computes per-segment video duration from total speech length.
- `IMAGE` — generates a prompt and image per segment, uploads it, marks the segment complete.

**Video queue**
- `VIDEO` — turns a segment's image into a short video with a zoom/pan effect.
- `VIDEO_CONCAT` — stitches all segment videos together with speech and burned-in subtitles into the final video.
- `FINALIZE` — marks the video and story as complete once concatenation succeeds.

## Getting started

You'll need an S3 bucket with public read access set up beforehand, since generated images/videos are served directly from bucket URLs.

```bash
docker compose up -d   # fill in .env first
pnpm db:push
pnpm start:dev
```

## What's next

- Retries for AI/FFmpeg failures (currently a hard fail)
- 9:16 and other aspect ratios, configurable through prompts/FFmpeg
- Real auth beyond anonymous JWT
- Stripe for usage limits / subscriptions
- Tune prompts specifically for horror rather than generic story generation
- Better FFmpeg video generation and tighter subtitle/audio sync and quality
